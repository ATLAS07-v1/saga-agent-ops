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
      raw: {
        paidProviderCalled: false,
        reason: "P0 safety: external paid provider execution is disabled until explicitly approved."
      }
    };
  }
};
