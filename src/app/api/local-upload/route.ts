import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Accept multipart/form-data to avoid JSON size bloat
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const dir = (form.get('dir') as string) || '';
    const filenameFromForm = (form.get('filename') as string) || undefined;
    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const uploadsRoot = path.join(process.cwd(), 'public', 'local_uploads');
    const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9_\-\.\/]/g, '_').replace(/\.\./g, '');
    const safeDirRaw = sanitize(dir || '');
    const safeDir = safeDirRaw.replace(/^\/+|\/+$/g, '');
    const fallbackName = (file as any).name || 'upload.bin';
    const safeFilename = sanitize(filenameFromForm || fallbackName);

    const targetDir = path.join(uploadsRoot, safeDir);
    await fs.mkdir(targetDir, { recursive: true });
    const filePath = path.join(targetDir, safeFilename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const url = safeDir ? `/local_uploads/${safeDir}/${safeFilename}` : `/local_uploads/${safeFilename}`;
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('local-upload error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
