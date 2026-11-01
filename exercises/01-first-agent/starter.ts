import {
    Config,
    ConfigProvider,
    Console,
    Effect,
    Schema,
    Redacted, // 处理secret类数据
    Layer,
    Context,
    Iterable
} from "effect"
import { FetchHttpClient, HttpClient } from "effect/http"
import { NodeFileSystem } from "@effect/platform-node"
import OpenAI from "openai"
import * as tavily from "@tavily/core"

/** 系统提示词 */
const AGENT_SYSTEM_PROMPT = `
你是一个智能旅行助手。你的任务是分析用户的请求，并使用可用工具一步步地解决问题。

# 可用工具:
- \`get_weather(city: str)\`: 查询指定城市的实时天气。
- \`get_attraction(city: str, weather: str)\`: 根据城市和天气搜索推荐的旅游景点。

# 输出格式要求:
你的每次回复必须严格遵循以下格式，包含一对Thought和Action：

Thought: [你的思考过程和下一步计划]
Action: [你要执行的具体行动]

Action的格式必须是以下之一：
1. 调用工具：function_name(arg_name="arg_value")
2. 结束任务：Finish[最终答案]

# 重要提示:
- 每次只输出一对Thought-Action
- Action必须在同一行，不要换行
- 当收集到足够信息可以回答用户问题时，必须使用 Action: Finish[最终答案] 格式结束

请开始吧！
`
// Config 也是 Effect, R是 ConfigProvider
const AppConfig = Config.all({
    openai: Config.all({
        apiKey: Config.Redacted("LLM_API_KEY"),
        baseURL: Config.URL("LLM_BASE_URL"),
        model: Config.NonEmptyString("LLM_MODEL_ID")
    }),

    tavily: Config.all({
        apiKey: Config.Redacted("TAVILY_API_KEY")
    })
})

type AppConfig = Effect.Success<typeof AppConfig>

class OpenAICompatibleClient extends Context.Service<
    OpenAICompatibleClient,
    {
        readonly generate: (
            prompt: string,
            systemPrompt: string
        ) => Effect.Effect<string, never, never>
    }
>()("OpenAICompatibleClient") { }

class TavilyClient extends Context.Service<TavilyClient, tavily.TavilyClient>()("TavilyClient") { }

/** wttr.in 响应 */
const WeatherResponseSchema = Schema.Struct({
    current_condition: Schema.Array(
        Schema.Struct({
            weatherDesc: Schema.Array(
                Schema.Struct({
                    value: Schema.String
                })
            ),
            temp_C: Schema.String
        })
    )
})

const getWeather = (
    city: string
) =>
    Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient
        const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`

        const response = yield* client.get(url)
        const raw = yield* response.json
        const data = yield* Schema.decodeUnknownEffect(
            WeatherResponseSchema
        )(raw)
        const current = data.current_condition[0]
        const description = current?.weatherDesc[0]?.value
        if (current === undefined || description === undefined) {
            return "错误：天气响应中缺少当前天气数据。"
        }
        return `${city}当前天气：${description}，气温${current.temp_C}摄氏度`
    }).pipe(
        Effect.catchTags({
            HttpClientError: err => Effect.succeed(`错误：查询天气时遇到网络问题 - ${err}`),
            SchemaError: err => Effect.succeed(`错误：解析天气数据失败，可能是城市名称无效 - ${err}`)
        })
    )

const getAttraction = (
    city: string,
    weather: string
) =>
    Effect.gen(function* () {
        const client = yield* TavilyClient
        const query = `'${city}' 在'${weather}'天气下最值得去的旅游景点推荐及理由`
        const response = yield* Effect.tryPromise(() => client.search(query, {
            searchDepth: "basic",
            includeAnswer: true
        }))
        if (response.answer) {
            return response.answer
        }
        const formattedResults = response.results.map(e => `- ${e.title}: ${e.content}`)
        if (formattedResults.length === 0) {
            return "抱歉，没有找到相关的旅游景点推荐。"
        }
        return "根据搜索，为您找到以下信息：\n" + formattedResults.join('\n')
    }).pipe(
        Effect.catch((error) =>
            Effect.succeed(
                `错误：执行Tavily搜索时出现问题 - ${String(error)}`
            )
        )
    )

const program = Effect.gen(function* () {
    // 初始配置
    const llm = yield* OpenAICompatibleClient
    const userPrompt = yield* Effect.sync(() => process.argv.slice(2).join("") || "你好，请帮我查询一下今天北京的天气，然后根据天气推荐一个合适的旅游景点。")
    const promptHistory = [`用户请求: ${userPrompt}`]
    yield* Console.log(`用户输入: ${userPrompt}\n ${"=".repeat(40)}`)

    const observe = (s: string) => Effect.gen(
        function* () {
            const str = `Observation: ${s}`
            yield* Console.log(str)
            promptHistory.push(str)
        }
    )
    for (const i of Iterable.range(0, 4)) {
        yield* Console.log(`--- 循环 ${i + 1} ---`)
        // 1. 构建Prompt
        const fullPrompt = promptHistory.join('\n')

        // 2. 调用LLM进行思考
        // 不处理异常了
        let llmOutput = (yield* llm.generate(fullPrompt, AGENT_SYSTEM_PROMPT)).trim()
        yield* Effect.log(`llm原始输出: ${llmOutput}`)
        // 3.1 解析输出
        const match = llmOutput.match(/(Thought: ?(?<thought>[\s\S]*?\r?)\r?\nAction: *(?<action>\w+))(?<actionParams>.*)(\r?\n|$)/)
        const truncated = match?.[0].trim()
        const groups = match?.groups;
        if (!(
            truncated
            && groups
            && groups["thought"] !== undefined
            && groups["action"] !== undefined
            && groups["actionParams"] !== undefined
        )) {
            // 错误输出，记录结果，返回给模型
            promptHistory.push(llmOutput)
            yield* observe("错误: 未能解析到 Thought Action 字段。请确保你的回复严格遵循 'Thought: ... Action: ...' 的格式。")
            continue
        }
        if (truncated !== llmOutput) {
            llmOutput = truncated
        }
        promptHistory.push(llmOutput)

        // 3.2 执行动作
        if (groups["action"] === 'Finish') {
            yield* Effect.log("Action=Finish")
            const finish = /^\[([^\r\n]+)\]$/.exec(groups["actionParams"].trim())
            const finalAnswer = finish?.[1]?.trim()
            if (!finalAnswer) {
                yield* observe("错误：结束任务必须使用 Finish[非空最终答案] 格式。")
                continue
            }
            yield* Console.log(`任务完成，最终答案: ${finalAnswer}`)
            return
        } else if (groups["action"] === 'get_weather') {
            yield* Effect.log("Action=get_weather")
            const match = groups["actionParams"].match(/\( *city *= *['"](?<city>[\S ]+)['"]\)/)
            if (match && match?.groups?.["city"] !== undefined) {
                // 直接yield，无需在这里手动传递依赖
                const toolResult = yield* getWeather(match.groups["city"])
                yield* observe(toolResult)
            } else {
                yield* observe(`错误：不符合 \`get_weather(city: str)\`格式，示例: get_weather(city="北京")`)
            }
        } else if (groups["action"] === 'get_attraction') {
            yield* Effect.log("Action=get_attraction")
            const match = groups["actionParams"].match(/\( *city *= *['"](?<city>[\S ]+)['"] *, *weather *= *['"](?<weather>[\S ]+)['"] *\)/)
            if (match && match?.groups?.["city"] !== undefined && match?.groups?.["weather"] !== undefined) {
                // 直接yield，无需在这里手动传递依赖
                const toolResult = yield* getAttraction(match.groups["city"], match.groups["weather"])
                yield* observe(toolResult)
            } else {
                yield* observe(`错误：不符合 \`get_attraction(city: str, weather: str)\`格式，示例: get_attraction(city="北京",weather="小雨转多云,平均温度23摄氏度，微风，紫外线弱")`)
            }
        } else {
            yield* observe(`错误：未定义的工具 \`${groups["action"]}\``)
        }
    }
    // 正常完成已在 Finish 分支返回；走到这里说明五轮仍未完成。
    return yield* Effect.fail(new Error("达到最大轮次 5，任务尚未完成"))
})

const LlmLive = Layer.effect(
    OpenAICompatibleClient,
    Effect.gen(function* () {
        const config = yield* AppConfig

        // SDK 初始化也是可能失败的同步操作
        const client = yield* Effect.try({
            try: () => new OpenAI({
                apiKey: Redacted.value(config.openai.apiKey),
                baseURL: config.openai.baseURL.toString()
            }),
            catch: err => new Error(`初始化 OpenAI客户端失败: ${String(err)}`)
        })

        return {
            /** 调用LLM API来生成回应。 */
            generate: (prompt: string, systemPrompt: string) =>
                Effect.gen(function* () {
                    const completion = yield* Effect.tryPromise(
                        () =>
                            client.chat.completions.create({
                                model: config.openai.model,
                                messages: [
                                    {
                                        role: "system",
                                        content: systemPrompt
                                    },
                                    {
                                        role: "user",
                                        content: prompt
                                    }
                                ],
                                stream: false
                            }),
                    )

                    const content = completion.choices[0]?.message.content
                    if (content === null || content === undefined) {
                        return yield* Effect.fail("响应内容为空")
                    }
                    yield* Console.log("大语言模型响应成功。")
                    return content
                }).pipe(
                    Effect.tapError(err => Console.log(`调用LLM API时发生错误: ${err}`)),
                    Effect.catch(_err => Effect.succeed(`错误：调用语言模型服务时出错。`))
                )
        } as const
    })
)

const TavilyClientLive = Layer.effect(
    TavilyClient,
    Effect.gen(function* () {
        const config = yield* AppConfig
        // SDK 初始化也是可能失败的同步操作
        const client = yield* Effect.try({
            try: () => tavily.tavily({
                apiKey: Redacted.value(config.tavily.apiKey),
            }),
            catch: err => new Error(`初始化Tavily客户端失败: ${String(err)}`)
        })


        return client
    })
)

/**
 * ConfigProvider.fromDotEnv() 创建一个Effect，R是 FileSystem:
 *
 * `Effect<ConfigProvider, PlatformError, FileSystem>`
 *
 * 转成 Layer:
 * `Layer<never, PlatformError, FileSystem>`
 */
const ConfigProviderLive = ConfigProvider.layer(ConfigProvider.fromDotEnv())

const AppLive = Layer.mergeAll(LlmLive, TavilyClientLive)

await Effect.runPromise(
    program.pipe(
        Effect.provide(AppLive
            .pipe(
                Layer.provide(
                    Layer.provide(
                        ConfigProviderLive,
                        NodeFileSystem.layer
                    )
                ),
            )
        ),
        Effect.provide(FetchHttpClient.layer)
    ))
