import assert from "node:assert/strict";
import { test } from "node:test";
import { Effect } from "effect";
import { parseAction, runAgent, type Dependencies } from "./agent.js";

test("FirstAgentTest：观察传给下一轮，Finish 后停止", async () => {
  let calls = 0;
  const deps: Dependencies = {
    generate: (history) => {
      calls++;
      if (calls === 1) return Effect.succeed('Action: get_weather(city="北京")');
      assert.ok(history.includes("Observation: 晴"));
      if (calls === 2) return Effect.succeed('Action: get_attraction(city="北京", weather="晴")');
      assert.ok(history.includes("Observation: 颐和园"));
      return Effect.succeed("Action: Finish[推荐颐和园]");
    },
    weather: (city) => { assert.equal(city, "北京"); return Effect.succeed("晴"); },
    attraction: (city, weather) => {
      assert.equal(city, "北京"); assert.equal(weather, "晴");
      return Effect.succeed("颐和园");
    },
  };
  assert.equal((await Effect.runPromise(runAgent("旅行", deps))).answer, "推荐颐和园");
  assert.equal(calls, 3);
});

test("无效指令反馈与轮次上限", async () => {
  let calls = 0;
  const deps: Dependencies = {
    generate: (history) => {
      if (calls++ > 0) assert.match(history.at(-1)!, /Observation: 错误/);
      return Effect.succeed("Action: unknown()");
    },
    weather: () => { throw new Error("不应调用"); },
    attraction: () => { throw new Error("不应调用"); },
  };
  await assert.rejects(Effect.runPromise(runAgent("旅行", deps, 2)), /最大轮次/);
  assert.equal(calls, 2);
  assert.throws(() => parseAction("Action: Finish[a]\nAction: Finish[b]"));
});

test("工具错误通过失败通道返回", async () => {
  const deps: Dependencies = {
    generate: () => Effect.succeed('Action: get_weather(city="北京")'),
    weather: () => Effect.fail(new Error("天气服务不可用")),
    attraction: () => Effect.succeed("unused"),
  };
  await assert.rejects(Effect.runPromise(runAgent("旅行", deps)), /天气服务不可用/);
});
