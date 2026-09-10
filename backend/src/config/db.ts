import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let dbUrl: string | undefined = process.env.DATABASE_URL;

if (process.env.VERCEL) {
  try {
    const tmpPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma/dev.db'),
        path.join(__dirname, '../../../prisma/dev.db'),
        path.join(__dirname, '../../prisma/dev.db'),
        path.join(__dirname, '../prisma/dev.db'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          fs.copyFileSync(p, tmpPath);
          break;
        }
      }
    }
    if (fs.existsSync(tmpPath)) {
      dbUrl = `file:${tmpPath}`;
    }
  } catch (err) {
    console.warn('Prisma Vercel DB init warning:', err);
  }
}

export const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

