# 00：工程与 Effect 入门

目标：能运行源码、检查类型、运行编译产物，并区分描述 Effect 和执行 Effect。
前置：能在终端运行命令，熟悉函数与模块的基本概念。本章离线运行，无模型费用。

## 从入口观察

阅读 [src/main.ts](../../src/main.ts)，执行 `pnpm start`，预期日志包含 `Hello, agents!`。
`Effect.log` 构造日志操作，`Effect.runPromise` 执行它。运行边界放在入口，后续模块返回可组合的 Effect。

## TypeScript 工程

`pnpm typecheck` 检查实现、示例、练习与自由实验的类型；`pnpm build` 按 `tsconfig.build.json` 只编译 `src/`；`pnpm start:built` 运行产物。
本仓库用 NodeNext 解析 ESM。以后导入本地 TypeScript 模块时使用对应的 `.js` 路径，使编译后的 Node.js 也能解析。
TypeScript 的类型检查发生在开发阶段，外部 JSON 仍需运行时验证。

## 借助 Rust 理解

Effect 可类比一个待执行的计算描述；组合操作通常不会立刻执行描述的业务副作用。
这能借助 Rust Future 的惰性来理解，但执行机制与类型保证不同；Effect 运行时并不提供 Rust 的所有权和借用检查。

## 动手与记录

完成 [本章练习](../../exercises/00-engineering-basics/README.md)。
在 [个人笔记](../notes/00-engineering-basics.md) 记录观察，在 [复现记录](../reproduction/00-engineering-basics.md) 查看本章范围和验证证据。
