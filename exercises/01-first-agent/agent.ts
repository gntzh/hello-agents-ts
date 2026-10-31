import { Effect } from "effect";

export type History = readonly string[];
export interface Dependencies {
  readonly generate: (history: History) => Effect.Effect<string, Error>;
  readonly weather: (city: string) => Effect.Effect<string, Error>;
  readonly attraction: (city: string, weather: string) => Effect.Effect<string, Error>;
}

type Action =
  | { readonly kind: "finish"; readonly answer: string }
  | { readonly kind: "weather"; readonly city: string }
  | { readonly kind: "attraction"; readonly city: string; readonly weather: string };

// 仅接受本章的工具协议，不把模型生成的文本当作 JavaScript 执行。
export function parseAction(output: string): Action {
  const lines = output.split(/\r?\n/).filter((line) => line.startsWith("Action: "));
  if (lines.length !== 1) throw new Error("必须提供且仅提供一个 Action");
  const action = lines[0]!.slice("Action: ".length).trim();
  const finish = /^Finish\[(.+)\]$/.exec(action);
  if (finish) return { kind: "finish", answer: finish[1]! };
  const weather = /^get_weather\(city="([^"\n]+)"\)$/.exec(action);
  if (weather) return { kind: "weather", city: weather[1]! };
  const attraction = /^get_attraction\(city="([^"\n]+)",\s*weather="([^"\n]+)"\)$/.exec(action);
  if (attraction) return { kind: "attraction", city: attraction[1]!, weather: attraction[2]! };
  throw new Error("未知工具或参数格式错误");
}

/** 有限轮次的工具调用循环。返回答案与完整轨迹；工具失败或轮次耗尽时失败。 */
export function runAgent(request: string, deps: Dependencies, maxSteps = 5) {
  return Effect.gen(function* () {
    const history: string[] = [`用户请求: ${request}`];
    for (let step = 0; step < maxSteps; step++) {
      // 传递快照，避免模型适配器改变循环内部维护的历史。
      const output = yield* deps.generate([...history]);
      history.push(output);
      // try 把同步解析异常变为 Effect 的显式错误通道。
      const parsed = yield* Effect.try({
        try: () => parseAction(output),
        catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)),
      }).pipe(Effect.result);
      if (parsed._tag === "Failure") {
        history.push(`Observation: 错误: ${parsed.failure.message}`);
        continue;
      }
      const action = parsed.success;
      if (action.kind === "finish") return { answer: action.answer, history };
      const observation = action.kind === "weather"
        ? yield* deps.weather(action.city)
        : yield* deps.attraction(action.city, action.weather);
      history.push(`Observation: ${observation}`);
    }
    return yield* Effect.fail(new Error(`达到最大轮次 ${maxSteps}，任务尚未完成`));
  });
}
