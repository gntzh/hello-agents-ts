# hello-agents-ts

这是我的 Agent 开发学习记录，使用 TypeScript 和 Effect 实践 Agent 的核心概念。

参考 [HelloAgents](https://github.com/jjyaoao/HelloAgents) 和
[HelloAgents-ts](https://github.com/JunLang-7/HelloAgents-ts)，结合可运行代码、中文教学与个人笔记逐步学习。

学习同时覆盖 Agent 开发、TypeScript 工程和 Effect，并结合 Rust 经验理解设计。

每个主题包含以下内容：

- **代码**：实现并运行一个具体行为。
- **教学**：解释概念、执行流程、设计原因与验证方式。
- **练习**：按章节动手修改代码，并对照参考答案。
- **笔记**：记录实际疑问、实验结果和自己的理解。
- **复现记录**：追踪上游版本、实现差异和验证结果。

学习内容从 [学习索引](docs/learning.md) 进入。

## 开始

需要 Node.js 22 或更高版本，以及 `package.json` 指定版本的 pnpm。

```sh
git submodule update --init --recursive
pnpm install
pnpm start
```

## 开发命令

- `pnpm dev`：监听源码变化并运行入口。
- `pnpm typecheck`：严格类型检查。
- `pnpm build`：编译到 `dist/`。
- `pnpm start:built`：运行编译产物。
- `pnpm check`：执行类型检查与构建。

## 目录

- `src/`：项目实现，目前入口为 `main.ts`。
- `examples/`：按章节组织的教学示例。
- `exercises/`：按章节组织的小练习与参考答案。
- `docs/lessons/`、`docs/notes/`、`docs/reproduction/`：教学、个人笔记和复现记录。
- `playground/`：学习实验目录。
- `docs/agents/`：Issue 跟踪与领域文档约定。
- `references/`：两份参考实现的 Git 子模块，使用方法见[学习索引](docs/learning.md)。

后续按实际实现添加模块和测试，工作项与规格记录在 GitHub Issues。
