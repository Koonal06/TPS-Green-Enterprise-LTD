type GenerateRequestBody = {
  model?: string;
  prompt?: string;
  stream?: boolean;
};

const MAX_PROMPT_LENGTH = 4000;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ollamaApiUrl = process.env.OLLAMA_API_URL;

  if (!ollamaApiUrl) {
    return res.status(500).json({
      error:
        'OLLAMA_API_URL is not configured. Set it to a publicly reachable Ollama /api/generate endpoint in Vercel project settings.',
    });
  }

  const { model, prompt, stream }: GenerateRequestBody = req.body || {};
  const allowedModels = new Set(
    String(process.env.ALLOWED_OLLAMA_MODELS || 'llama3.2:1b')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  );

  if (!prompt || !model) {
    return res.status(400).json({ error: 'Missing required fields: model and prompt' });
  }

  if (!allowedModels.has(model)) {
    return res.status(400).json({ error: 'Requested model is not allowed' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(413).json({ error: 'Prompt is too large' });
  }

  try {
    const upstreamResponse = await fetch(ollamaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: Boolean(stream),
      }),
    });

    const rawText = await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        error: 'Upstream Ollama request failed',
      });
    }

    try {
      const data = JSON.parse(rawText);
      return res.status(200).json(data);
    } catch {
      return res.status(502).json({
        error: 'Invalid JSON received from Ollama',
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to contact the configured Ollama server.';

    return res.status(502).json({
      error: 'Unable to contact the configured Ollama server',
      details: message,
    });
  }
}
