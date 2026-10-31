# 00：工程初始化复现记录

## 范围与参考

本章建立 TypeScript / Effect 学习环境，尚未复现 Agent 行为。

- HelloAgents：`c597a7ca46ea9969e5b21d9e130549ab69626ff9`，[示例组织](../../references/HelloAgents/examples/README.md)。
- HelloAgents-ts：`bee762341779830e0510df89431aedc6a466c17a`，[基本示例](../../references/HelloAgents-ts/examples/basic.ts)、[说明](../../references/HelloAgents-ts/README_CN.md)。

Python 示例按能力分组，TypeScript 参考提供功能示例；本仓库增加按学习章节组织的练习、教学与笔记。
本仓库采用 Node.js、pnpm 与 Effect，当前入口仅验证 Effect 日志运行。

## 行为与验证

- `pnpm check`：类型检查与构建应成功。
- `pnpm start` 和 `pnpm start:built`：日志应包含 `Hello, agents!`。
- `node --import tsx exercises/00-engineering-basics/solution.ts`：应输出 `Hello, Rust learner!`。

本次验证（2026-10-31）：以上四条命令均成功，源码与编译产物输出包含预期日志，练习参考答案输出与预期一致。

后续章节记录：目标行为、上游文件与提交、实现差异及原因、验证命令与实际结果、未覆盖范围。规格与待办继续放 GitHub Issues。
