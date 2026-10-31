# FirstAgentTest

对应课程第一章 [FirstAgentTest.py](../../references/hello-agents-course/code/chapter1/FirstAgentTest.py)。
本练习由 AI 辅助实现，真实调用兼容 OpenAI 的模型服务、wttr.in 天气与 Tavily 搜索。

先执行 `cp .env.example .env`，在本地填入模型地址、模型名称及两个服务的密钥；`.env` 已被 Git 忽略。

```sh
pnpm exercise:first-agent
# 可选自定义请求
pnpm exercise:first-agent "查询上海天气并推荐合适景点，附上来源"
node --import tsx --test exercises/01-first-agent/*.test.ts
```

预期：模型调用天气与景点工具，Observation 回填后输出最终建议；结果随实时天气、搜索与模型变化。
模型调用按服务商计费；Tavily 使用 basic 搜索并消耗账户额度，免费额度耗尽后按账户策略处理。最多五轮，不自动重试。
`LLM_BASE_URL` 填 API 根地址（通常带 `/v1`），程序自动追加 `/chat/completions`。
测试注入模拟 HTTP 响应，不消耗服务额度。services.ts 是实际 HTTP 适配器。

## 自己尝试

在 starter.ts 实现同样流程：保存用户请求；获取一条模型指令；解析白名单工具；执行并把观察加入历史；Finish 返回；达到五轮仍未完成则失败。
可复用 Dependencies 类型，先不看 agent.ts 与 solution.ts。

验收：下一次生成能读取前一轮观察；未知工具不会被执行；无效指令能反馈给模型；Finish 后停止调用；轮次耗尽明确报错。
进阶：更换为根据 history 决定下一步的模拟模型，验证景点调用使用天气观察中的数据。

教学见 [第一章](../../docs/lessons/01-first-agent.md)。
