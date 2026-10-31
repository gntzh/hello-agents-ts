import { Effect } from "effect";
import { runAgent } from "./agent.js";
import { createServices, readConfig } from "./services.js";

// 配置只在入口读取；模块和测试通过参数注入依赖。
try {
  const config = readConfig(process.env);
  const request = process.argv.slice(2).join(" ") || "查询今天北京的天气，根据天气推荐一个旅游景点，并附上搜索来源。";
  console.log(`用户请求: ${request}`);
  const result = await Effect.runPromise(runAgent(request, createServices(config)));
  console.log(result.history.join("\n"));
  console.log(`最终答案: ${result.answer}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "FirstAgentTest 运行失败");
  process.exitCode = 1;
}
