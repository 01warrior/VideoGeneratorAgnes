import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const currentDir = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to resolve API Key (Header or query or body or env)
  const resolveApiKey = (req: Request, explicitKey?: string): string => {
    if (explicitKey && explicitKey.trim().length > 0) return explicitKey.trim();
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) return token;
    }
    const customHeader = req.headers['x-api-key'] as string;
    if (customHeader && customHeader.trim().length > 0) return customHeader.trim();
    return process.env.AGNES_API_KEY || '';
  };

  // API Route: Create Video Task
  app.post('/api/videos/create', async (req: Request, res: Response) => {
    try {
      const { provider = 'agnes', params, apiKey: bodyKey } = req.body;
      const apiKey = resolveApiKey(req, bodyKey);

      if (provider === 'mock') {
        // Mock provider simulator for testing without consuming credits
        const mockTaskId = 'mock_vid_' + Math.random().toString(36).substring(2, 9);
        return res.json({ taskId: mockTaskId, provider: 'mock' });
      }

      if (provider === 'agnes') {
        if (!apiKey) {
          return res.status(400).json({
            error: "Clé API Agnes AI requise. Veuillez renseigner votre clé API (sk-...) dans les paramètres ou l'en-tête.",
          });
        }

        // Dimension normalization based on aspect ratio
        let width = 1152;
        let height = 768;
        const aspectRatio = params?.aspectRatio || '16:9';
        const model = params?.model || 'agnes-video-2.5';
        const duration = typeof params?.durationSeconds === 'number' ? params.durationSeconds : 5;
        const resolution = params?.resolution || '720p';

        if (aspectRatio === '9:16') {
          width = 768;
          height = 1152;
        } else if (aspectRatio === '1:1') {
          width = 768;
          height = 768;
        }

        const payload: Record<string, unknown> = {
          model,
          prompt: params.prompt,
          duration,
          aspect_ratio: aspectRatio,
          size: resolution,
          width,
          height,
          num_frames: Math.min(Math.round(duration * 24), 288),
          frame_rate: 24,
        };

        if (params.imageUrl && params.imageUrl.trim().length > 0) {
          payload.image_url = params.imageUrl.trim();
        }

        const agnesRes = await fetch('https://apihub.agnes-ai.com/v1/videos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
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

        return res.json({ taskId, raw: data });
      }

      if (provider === 'kling' || provider === 'fal') {
        return res.status(501).json({
          error: `Le provider '${provider}' est disponible dans l'architecture Adapter (structure prête). Activez Agnes AI ou le simulateur de test.`,
        });
      }

      return res.status(400).json({ error: `Provider non reconnu: ${provider}` });
    } catch (err: unknown) {
      console.error('Erreur /api/videos/create:', err);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return res.status(500).json({ error: `Erreur interne du serveur: ${message}` });
    }
  });

  // API Route: Check Status
  app.get('/api/videos/status', async (req: Request, res: Response) => {
    try {
      const taskId = req.query.taskId as string;
      const provider = (req.query.provider as string) || 'agnes';
      const apiKey = resolveApiKey(req, req.query.apiKey as string);

      if (!taskId) {
        return res.status(400).json({ error: 'taskId est requis' });
      }

      if (provider === 'mock') {
        return res.json({
          status: 'completed',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        });
      }

      if (provider === 'agnes') {
        if (!apiKey) {
          return res.status(400).json({ error: 'Clé API Agnes requise pour vérifier le statut' });
        }

        // Try primary endpoint: GET /agnesapi?video_id=<VIDEO_ID>
        let endpoint = `https://apihub.agnes-ai.com/agnesapi?video_id=${encodeURIComponent(taskId)}`;
        let response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        // Fallback endpoint if primary fails with 404 or unsupported
        if (!response.ok && (response.status === 404 || response.status === 405)) {
          endpoint = `https://apihub.agnes-ai.com/v1/videos/${encodeURIComponent(taskId)}`;
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          });
        }

        const data = await response.json();

        if (!response.ok) {
          return res.status(response.status).json({
            status: 'failed',
            error: data.message || data.error || `Erreur Agnes API (${response.status})`,
            raw: data,
          });
        }

        // Normalize state
        // Expected formats: state / status ("completed" | "succeeded" | "processing" | "pending" | "failed")
        const rawStatus = (data.status || data.state || data.task_status || '').toLowerCase();
        let status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';

        if (['completed', 'succeeded', 'success', 'done'].includes(rawStatus)) {
          status = 'completed';
        } else if (['failed', 'error', 'canceled', 'rejected'].includes(rawStatus)) {
          status = 'failed';
        } else if (['pending', 'queued', 'waiting', 'initialized'].includes(rawStatus)) {
          status = 'pending';
        } else {
          status = 'processing';
        }

        const videoUrl =
          data.metadata?.url ||
          data.video_url ||
          data.url ||
          data.output?.url ||
          data.result?.url ||
          (data.videos && data.videos[0]?.url);

        const error = data.error || data.message || (status === 'failed' ? 'Génération échouée côté Agnes' : undefined);
        const progress = typeof data.progress === 'number' ? data.progress : undefined;

        return res.json({
          status,
          videoUrl,
          error,
          progress,
          raw: data,
        });
      }

      return res.status(400).json({ error: `Provider non supporté: ${provider}` });
    } catch (err: unknown) {
      console.error('Erreur /api/videos/status:', err);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return res.status(500).json({ status: 'failed', error: `Erreur interne: ${message}` });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Agnes AI Video Adapter Service',
      version: '2.0',
      hasDefaultKey: Boolean(process.env.AGNES_API_KEY),
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur vidéo démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Échec du démarrage du serveur:', err);
  process.exit(1);
});
