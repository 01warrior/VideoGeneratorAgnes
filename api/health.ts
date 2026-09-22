import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    service: 'Agnes AI Video Adapter Service (Vercel Serverless & Node.js)',
    version: '2.0',
    hasDefaultKey: Boolean(process.env.AGNES_API_KEY && process.env.AGNES_API_KEY.trim().length > 0),
  });
}
