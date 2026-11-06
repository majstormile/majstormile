import 'server-only';
// Off-site copy of the daily backup in Google Drive. Optional: active only when all four variables are set.
// Uses an OAuth refresh token for the owner's Google account and the narrow drive.file scope
// (the app can only see files it created itself).
const need = () => {
  const id = process.env.GOOGLE_DRIVE_CLIENT_ID, secret = process.env.GOOGLE_DRIVE_CLIENT_SECRET, refresh = process.env.GOOGLE_DRIVE_REFRESH_TOKEN, folder = process.env.GOOGLE_DRIVE_FOLDER_ID;
  return id && secret && refresh && folder ? {id, secret, refresh, folder} : null;
};
export const driveReady = () => !!need();
const KEEP_DAYS = 30;

async function token(c: NonNullable<ReturnType<typeof need>>) {
  const r = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', headers: {'content-type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams({client_id: c.id, client_secret: c.secret, refresh_token: c.refresh, grant_type: 'refresh_token'})});
  const j = await r.json().catch(() => ({})) as {access_token?: string; error?: string};
  if (!r.ok || !j.access_token) throw new Error('Google Drive sign-in failed: ' + (j.error || r.status));
  return j.access_token;
}

export async function uploadToDrive(name: string, body: string): Promise<string> {
  const c = need(); if (!c) return '';
  const t = await token(c), auth = {authorization: 'Bearer ' + t};
  const boundary = 'mm' + Date.now();
  const meta = JSON.stringify({name, parents: [c.folder], mimeType: 'application/json'});
  const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
  const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {method: 'POST', headers: {...auth, 'content-type': `multipart/related; boundary=${boundary}`}, body: multipart});
  if (!r.ok) throw new Error('Google Drive upload failed: ' + r.status);
  // Retention: remove this app's copies older than KEEP_DAYS (best effort).
  try {
    const cutoff = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString();
    const q = encodeURIComponent(`'${c.folder}' in parents and trashed=false and createdTime < '${cutoff}'`);
    const l = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=100`, {headers: auth});
    const files = ((await l.json()) as {files?: {id: string}[]}).files || [];
    for (const f of files) await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}`, {method: 'DELETE', headers: auth});
  } catch { /* ignore */ }
  return name;
}
