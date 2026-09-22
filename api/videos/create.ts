import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurer CORS si nécessaire
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  try {
    const { provider = 'agnes', params, apiKey: bodyKey } = req.body || {};

    const resolveApiKey = (): string => {
      if (bodyKey && String(bodyKey).trim().length > 0) return String(bodyKey).trim();
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token) return token;
      }
      return process.env.AGNES_API_KEY || '';
    };

    const apiKey = resolveApiKey();

    if (provider === 'mock') {
      const mockTaskId = 'mock_vid_' + Math.random().toString(36).substring(2, 9);
      return res.status(200).json({ taskId: mockTaskId, provider: 'mock' });
    }

    if (provider === 'agnes') {
      if (!apiKey) {
        return res.status(400).json({
          error: "Clé API Agnes AI requise. Veuillez renseigner votre clé API (sk-...) dans les paramètres ou les variables d'environnement Vercel.",
        });
      }

      let width = 1152;
      let height = 768;
      const aspectRatio = params?.aspectRatio || '16:9';

      if (aspectRatio === '9:16') {
        width = 768;
        height = 1152;
      } else if (aspectRatio === '1:1') {
        width = 768;
        height = 768;
      }

      const payload: Record<string, unknown> = {
        model: 'agnes-video-v2.0',
        prompt: params.prompt,
        width,
        height,
        num_frames: 121,
        frame_rate: 24,
      };

      if (params.imageUrl && String(params.imageUrl).trim().length > 0) {
        payload.image_url = String(params.imageUrl).trim();
      }

      const agnesRes = await fetch('https://apihub.agnes-ai.com/v1/videos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await agnesRes.json();

      if (!agnesRes.ok) {
        return res.status(agnesRes.status).json({
          error: data.message || data.error || `Erreur API Agnes AI (${agnesRes.status})`,
          raw: data,
        });
      }

      const taskId = data.video_id || data.task_id || data.id;
      if (!taskId) {
        return res.status(500).json({
          error: "L'API Agnes n'a pas retourné de video_id ou task_id valide.",
          raw: data,
        });
      }

      return res.status(200).json({ taskId, raw: data });
    }

    return res.status(400).json({ error: `Provider non supporté : ${provider}` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
}
