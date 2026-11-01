import { Effect, Console } from "effect";

const greeting = Effect.succeed("Rust learner").pipe(
  Effect.map((name) => `Hello, ${name}!`),
);

await Effect.runPromise(greeting.pipe(Effect.andThen(Console.log)));
