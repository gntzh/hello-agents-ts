import assert from "node:assert/strict";
import { test } from "node:test";
import { Effect } from "effect";
import { createServices, readConfig } from "./services.js";

const config = { baseUrl: "https://model.example/v1", apiKey: "test-model-key", model: "test-model", tavilyKey: "test-search-key" };

test("真实服务适配器：URL、认证、请求参数与结果解码", async () => {
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    if (url.includes("chat/completions")) {
      assert.equal(url, "https://model.example/v1/chat/completions");
      assert.equal(headers.get("Authorization"), "Bearer test-model-key");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.model, "test-model");
      assert.match(body.messages[1].content, /Observation: 晴/);
      return Response.json({ choices: [{ message: { content: "Action: Finish[完成]" } }] });
    }
    if (url.includes("wttr.in")) {
      assert.ok(url.includes(encodeURIComponent("北京")));
      return Response.json({ current_condition: [{ weatherDesc: [{ value: "Sunny" }], temp_C: "25" }] });
    }
    assert.equal(url, "https://api.tavily.com/search");
    assert.equal(headers.get("Authorization"), "Bearer test-search-key");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.search_depth, "basic");
    assert.match(body.query, /北京.*晴/);
    return Response.json({ answer: "颐和园", results: [{ title: "景点", content: "介绍", url: "https://example.com/park" }] });
  };
  const deps = createServices(config, fetcher);
  assert.match(await Effect.runPromise(deps.generate(["Observation: 晴"])), /Finish/);
  assert.match(await Effect.runPromise(deps.weather("北京")), /Sunny.*25/);
  assert.match(await Effect.runPromise(deps.attraction("北京", "晴")), /https:\/\/example.com\/park/);
});

test("配置缺失、HTTP 错误和畸形响应明确失败", async () => {
  assert.throws(() => readConfig({}), /LLM_BASE_URL/);
  const failed = createServices(config, async () => new Response("secret body", { status: 401 }));
  await assert.rejects(Effect.runPromise(failed.weather("北京")), /天气 HTTP 401/);
  const malformed = createServices(config, async () => Response.json({ choices: [] }));
  await assert.rejects(Effect.runPromise(malformed.generate([])), /字段不符合预期/);
});
