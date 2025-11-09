'use client';

export async function uploadViaLocalApi(file: File, dir: string, filename?: string): Promise<string> {
  const name = filename || (file as any).name || `upload-${Date.now()}`;
  const fd = new FormData();
  fd.append('dir', dir);
  fd.append('filename', name);
  fd.append('file', file);
  const res = await fetch('/api/local-upload', {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Local upload failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  if (!json?.url) throw new Error('Local upload did not return a URL');
  return json.url as string;
}
