import type { AgentRunInput } from "./index";

export type ProviderGenerateInput = {
  agentSlug: string;
  promptVersion: string;
  systemPrompt: string;
  userPrompt: string;
  input: AgentRunInput["input"];
  timeoutMs: number;
};

export type ProviderGenerateResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  estimatedUsd: number;
  finishReason: "stop" | "length" | "tool_calls" | "error" | "unknown";
  raw?: Record<string, unknown>;
};

export type ProviderAdapter = {
  name: string;
  model: string;
  generate(input: ProviderGenerateInput): Promise<ProviderGenerateResult>;
};

function estimateTokens(value: string) {
  return Math.max(1, Math.ceil(value.length / 4));
}

export const localDeterministicProvider: ProviderAdapter = {
  name: "local-runtime",
  model: "phase-1-deterministic-worker",
  async generate(input) {
    const serializedInput = JSON.stringify(input.input);
    const text = [
      `agent=${input.agentSlug}`,
      `promptVersion=${input.promptVersion}`,
      "mode=local-deterministic",
      "result=structured artifact generated without an external paid LLM call"
    ].join("\n");
    const inputTokens = estimateTokens(`${input.systemPrompt}\n${input.userPrompt}\n${serializedInput}`);
    const outputTokens = estimateTokens(text);

    return {
      text,
      inputTokens,
      outputTokens,
      estimatedUsd: Number(((inputTokens + outputTokens) * 0.0000005).toFixed(6)),
      finishReason: "stop",
      raw: {
        paidProviderCalled: false,
        reason: "P0 safety: external paid provider execution is disabled until explicitly approved."
      }
    };
  }
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function createOllamaProvider(options: {
  endpoint?: string;
  model?: string;
  estimatedUsdPer1kTokens?: number;
} = {}): ProviderAdapter {
  const endpoint = options.endpoint ?? "http://localhost:11434";
  const model = options.model ?? "llama3.1";
  const estimatedUsdPer1kTokens = options.estimatedUsdPer1kTokens ?? 0;

  return {
    name: "ollama",
    model,
    async generate(input) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), input.timeoutMs);
      const prompt = [
        input.systemPrompt,
        "",
        "Return concise structured analysis for the already-defined runtime schema.",
        input.userPrompt
      ].join("\n");

      try {
        const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            prompt,
            stream: false
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`ollama_http_${response.status}`);
        }

        const body = toRecord(await response.json());
        const text = typeof body.response === "string" ? body.response : "";
        const inputTokens =
          typeof body.prompt_eval_count === "number" ? body.prompt_eval_count : estimateTokens(prompt);
        const outputTokens = typeof body.eval_count === "number" ? body.eval_count : estimateTokens(text);
        const totalTokens = inputTokens + outputTokens;

        return {
          text,
          inputTokens,
          outputTokens,
          estimatedUsd: Number(((totalTokens / 1000) * estimatedUsdPer1kTokens).toFixed(6)),
          finishReason:
            typeof body.done_reason === "string" && body.done_reason.includes("length")
              ? "length"
              : "stop",
          raw: {
            provider: "ollama",
            endpoint,
            model,
            done: body.done
          }
        };
      } finally {
        clearTimeout(timeout);
      }
    }
  };
}
