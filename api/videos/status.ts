import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez GET.' });
  }

  try {
    const { taskId, provider = 'agnes' } = req.query;

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: 'Paramètre taskId requis.' });
    }

    const resolveApiKey = (): string => {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token) return token;
      }
      return process.env.AGNES_API_KEY || '';
    };

    const apiKey = resolveApiKey();

    if (provider === 'mock') {
      return res.status(200).json({
        status: 'completed',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        progress: 100,
      });
    }

    if (provider === 'agnes') {
      if (!apiKey) {
        return res.status(400).json({
          error: "Clé API Agnes AI requise pour vérifier l'état.",
        });
      }

      // 1. Tenter le endpoint dédié /agnesapi?video_id=...
      let agnesRes = await fetch(`https://apihub.agnes-ai.com/agnesapi?video_id=${encodeURIComponent(taskId)}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      });

      // 2. Repli si nécessaire sur /v1/videos/:id
      if (agnesRes.status === 404) {
        agnesRes = await fetch(`https://apihub.agnes-ai.com/v1/videos/${encodeURIComponent(taskId)}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
        });
      }

      const data = await agnesRes.json();

      if (!agnesRes.ok) {
        return res.status(agnesRes.status).json({
          error: data.message || data.error || `Erreur API Agnes AI (${agnesRes.status})`,
          raw: data,
        });
      }

      // Normalisation de l'état
      let status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';
      const rawStatus = (data.status || data.state || '').toLowerCase();

      if (['completed', 'succeeded', 'done', 'success'].includes(rawStatus)) {
        status = 'completed';
      } else if (['failed', 'error', 'canceled', 'cancelled'].includes(rawStatus)) {
        status = 'failed';
      } else if (['pending', 'queued', 'waiting'].includes(rawStatus)) {
        status = 'pending';
      }

      const videoUrl =
        data.video_url ||
        data.output_url ||
        (Array.isArray(data.output) ? data.output[0] : null) ||
        (data.result && typeof data.result === 'object' ? data.result.video_url || data.result.url : null) ||
        data.url ||
        null;

      if (videoUrl && status !== 'failed') {
        status = 'completed';
      }

      return res.status(200).json({
        status,
        videoUrl,
        progress: data.progress ?? (status === 'completed' ? 100 : undefined),
        error: status === 'failed' ? (data.error || data.message || 'La génération a échoué.') : undefined,
        raw: data,
      });
    }

    return res.status(400).json({ error: `Provider non supporté : ${provider}` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
}
