type GenerateRequestBody = {
  model?: string;
  prompt?: string;
  stream?: boolean;
};

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

  if (!prompt || !model) {
    return res.status(400).json({ error: 'Missing required fields: model and prompt' });
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
        details: rawText,
      });
    }

    try {
      const data = JSON.parse(rawText);
      return res.status(200).json(data);
    } catch {
      return res.status(502).json({
        error: 'Invalid JSON received from Ollama',
        details: rawText,
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
