# 00：组合并运行 Effect

前置阅读：[教学](../../docs/lessons/00-engineering-basics.md)。

修改 `starter.ts`：构造一个成功值为字符串的 Effect，再用 `Effect.map` 将其转为问候语，最后运行并打印。

```sh
node --import tsx exercises/00-engineering-basics/starter.ts
pnpm check
```

验收：输入名字 `Rust learner` 时输出 `Hello, Rust learner!`；把名字改为 `Agent learner` 后输出随之变化。无需网络或模型密钥。
完成后查看 [参考答案](solution.ts)，解释构造、组合和执行分别发生在哪一行。
