import { Effect } from "effect";

// succeed 描述一个成功值；map 改变成功值，组合阶段尚未执行程序。
const greeting = Effect.succeed("Rust learner").pipe(
  Effect.map((name) => `Hello, ${name}!`),
);

// 在程序入口交给运行时执行；runPromise 把结果桥接到 JavaScript Promise。
console.log(await Effect.runPromise(greeting));
