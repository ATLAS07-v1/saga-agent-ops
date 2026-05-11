export type RetryPolicy = {
  maxAttempts: number;
  backoffMs: number;
};

export type RuntimePolicy = {
  timeoutMs: number;
  retry: RetryPolicy;
  maxToolCalls: number;
};

export const defaultRuntimePolicy: RuntimePolicy = {
  timeoutMs: 12_000,
  retry: {
    maxAttempts: 2,
    backoffMs: 150
  },
  maxToolCalls: 4
};

export function collectRequestedTools(input: Record<string, unknown>) {
  const requestedTools = input.requestedTools;
  if (!Array.isArray(requestedTools)) return [];

  return requestedTools.filter((tool): tool is string => typeof tool === "string");
}

export function findBlockedTools(allowedTools: string[], requestedTools: string[]) {
  return requestedTools.filter((tool) => !allowedTools.includes(tool));
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function withTimeout<T>(work: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`agent_timeout_${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([work, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function runWithRetryAndTimeout<T>(
  work: () => Promise<T>,
  policy: RuntimePolicy = defaultRuntimePolicy
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.retry.maxAttempts; attempt += 1) {
    try {
      return await withTimeout(work(), policy.timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt < policy.retry.maxAttempts) {
        await sleep(policy.retry.backoffMs * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("agent_execution_failed");
}
