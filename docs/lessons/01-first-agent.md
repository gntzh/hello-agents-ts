# 01：FirstAgentTest

对应课程第一章 `code/chapter1/FirstAgentTest.py`。前置：第 00 章、TypeScript 函数与联合类型。

目标：理解模型决定下一步、程序执行工具、Observation 回填历史、Finish 退出的循环。
从 [练习说明](../../exercises/01-first-agent/README.md) 配置 `.env` 并运行真实服务。模型和 Tavily 调用消耗账户额度，测试可离线执行。

## 阅读顺序

先读 solution.ts 的依赖装配和 services.ts 的 HTTP 适配，再读 agent.ts 的 runAgent，最后读 parseAction。
循环负责控制流，Dependencies 提供模型与工具，入口负责执行 Effect。
模型输出是数据：解析器仅接受白名单格式，不执行生成的代码。

## TypeScript 与 Effect

Action 是可辨识联合，kind 分支让编译器缩小类型。Dependencies 用函数接口隔离外部服务。
Effect.gen 使多步操作按顺序组合，yield* 取得成功值并传播失败；Effect.try 将同步异常纳入错误通道。
解析失败经 Effect.result 转为可检查的值，写回历史以便下一轮修正；工具失败则直接结束本次程序。

从 Rust 看，Action 类似 enum，Dependencies 类似一组传入的行为；Effect 的错误参数可帮助理解失败路径，但不是 Rust 的所有权或借用保证。

服务使用 `fetch` 调用 Chat Completions、wttr.in 与 Tavily；`Effect.tryPromise` 把网络失败接入错误通道。HTTP JSON 从 unknown 开始逐字段验证，密钥只在入口配置中读取。

接口参考：[OpenAI 官方文档](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)、[Tavily 搜索文档](https://docs.tavily.com/documentation/api-reference/endpoint/search)。

## 实验

修改模型响应为未知工具，观察错误如何进入历史；让模型始终调用工具，观察五轮上限；让天气工具失败，观察程序如何结束。
把结果填入 [个人笔记](../notes/01-first-agent.md)。实现差异见 [复现记录](../reproduction/01-first-agent.md)。
