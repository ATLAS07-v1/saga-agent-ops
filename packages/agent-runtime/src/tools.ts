export type WebResearchResult = {
  ok: boolean;
  url: string;
  title?: string;
  description?: string;
  status?: number;
  error?: string;
};

function extractTag(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return match?.[1]?.trim().replace(/\s+/g, " ");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function fetchCompanyWebsiteSummary(url: string, timeoutMs = 1_500): Promise<WebResearchResult> {
  if (!isHttpUrl(url)) {
    return {
      ok: false,
      url,
      error: "invalid_url"
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "SagaAgentOps/0.1 read-only research"
      },
      signal: controller.signal
    });
    const html = await response.text();
    const title = extractTag(html, /<title[^>]*>([^<]+)<\/title>/i);
    const description = extractTag(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    );

    return {
      ok: response.ok,
      url,
      status: response.status,
      ...(title ? { title } : {}),
      ...(description ? { description } : {})
    };
  } catch (error) {
    return {
      ok: false,
      url,
      error: error instanceof Error ? error.message : "web_research_failed"
    };
  } finally {
    clearTimeout(timeout);
  }
}
