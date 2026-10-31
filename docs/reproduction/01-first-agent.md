# 01：FirstAgentTest 复现记录

课程参考：子模块提交 `36f583c233ea5cee4537ef93455702b55053af18`，文件 [FirstAgentTest.py](../../references/hello-agents-course/code/chapter1/FirstAgentTest.py)。

本次范围：AI 辅助实现真实模型与工具服务调用，代码见 [练习](../../exercises/01-first-agent/README.md)。
保留天气、景点、Finish 三种行动、历史回填和默认五轮上限。

差异：通过 fetch 调用兼容 OpenAI 的 Chat Completions、wttr.in 和 Tavily；服务依赖仍可注入，测试使用模拟 HTTP 响应。
仅解析 Action，不要求输出思考过程；严格限定工具及参数顺序，不支持任意字符串转义。
格式错误写回历史，工具失败进入 Effect 错误通道，轮次耗尽显式失败。
配置从环境变量读取，请求超时 60 秒，不自动重试。搜索保留来源 URL。

验证（2026-10-31）：pnpm check、离线测试均通过。真实服务已使用本地 .env 完成联调：模型依次调用北京天气与 Tavily 景点搜索，再输出带来源的最终答案，进程退出码为 0。此记录验证链路，不保证搜索来源的质量、时效性或模型建议的准确性。
测试覆盖观察传递、工具参数、完成退出、格式错误反馈、未知工具拒绝、轮次上限与工具失败。
未来迁移 Rust 可沿用这些行为契约；外部服务适配单独替换。
