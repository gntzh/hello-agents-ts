import { Effect } from "effect";

// 构造日志操作；实际副作用由下方的运行时入口执行。
const main = Effect.log("Hello, agents!");

await Effect.runPromise(main);
