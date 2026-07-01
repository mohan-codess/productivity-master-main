import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const execPromise = promisify(exec);

function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: message }, { status });
}

function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

function splitBuffer(buf: Buffer, delimiter: Buffer): Buffer[] {
  const parts: Buffer[] = [];
  let start = 0;
  let index = buf.indexOf(delimiter, start);

  while (index !== -1) {
    parts.push(buf.slice(start, index));
    start = index + delimiter.length;
    index = buf.indexOf(delimiter, start);
  }

  if (start < buf.length) {
    parts.push(buf.slice(start));
  }

  return parts;
}

function parseMultipart(body: Buffer, boundary: string) {
  const delimiter = Buffer.from('--' + boundary);
  const parts = splitBuffer(body, delimiter);
  const files: Record<string, { filename: string; contentType: string; data: Buffer }> = {};
  const fields: Record<string, string> = {};
  const diagnostics: string[] = [];

  const CRLF = Buffer.from('\r\n');
  const CRLF_DASH_DASH = Buffer.from('\r\n--');
  const CRLF_DASH_DASH_CRLF = Buffer.from('\r\n--\r\n');

  diagnostics.push(`Total parts split: ${parts.length}`);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.length === 0) {
      diagnostics.push(`Part ${i}: empty`);
      continue;
    }

    let partContent = part;
    if (partContent.indexOf(CRLF) === 0) {
      partContent = partContent.slice(2);
    }

    if (partContent.length >= 6 && partContent.slice(partContent.length - 6).equals(CRLF_DASH_DASH_CRLF)) {
      partContent = partContent.slice(0, -6);
    } else if (partContent.length >= 4 && partContent.slice(partContent.length - 4).equals(CRLF_DASH_DASH)) {
      partContent = partContent.slice(0, -4);
    } else if (partContent.length >= 2 && partContent.slice(partContent.length - 2).equals(CRLF)) {
      partContent = partContent.slice(0, -2);
    }

    if (partContent.length === 0) {
      diagnostics.push(`Part ${i}: empty after trim`);
      continue;
    }

    const headerEndIndex = partContent.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEndIndex === -1) {
      diagnostics.push(`Part ${i} length ${partContent.length}: no double CRLF found`);
      continue;
    }

    const headersStr = partContent.slice(0, headerEndIndex).toString('utf-8');
    const partBody = partContent.slice(headerEndIndex + 4);

    const contentDispositionMatch = headersStr.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
    if (!contentDispositionMatch) {
      diagnostics.push(`Part ${i}: no Content-Disposition match. Headers: "${headersStr.replace(/\r\n/g, '\\r\\n')}"`);
      continue;
    }

    const name = contentDispositionMatch[1];
    const filename = contentDispositionMatch[2];

    diagnostics.push(`Part ${i}: name="${name}" filename="${filename || ''}" bodyLen=${partBody.length}`);

    if (filename !== undefined) {
      const contentTypeMatch = headersStr.match(/Content-Type:\s*([^\r\n]+)/i);
      const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
      files[name] = {
        filename,
        contentType,
        data: partBody,
      };
    } else {
      fields[name] = partBody.toString('utf-8');
    }
  }

  return { files, fields, diagnostics };
}

// POST /api/entries/upload — transcode uploaded video to low-quality MP4 and save path
export async function POST(req: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return err('Unauthorized', 401);

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return err('Content-Type must be multipart/form-data', 415);
    }

    const boundaryMatch = contentType.match(/boundary=([^;]+)/);
    if (!boundaryMatch) {
      return err('Missing boundary in Content-Type', 400);
    }
    const boundary = boundaryMatch[1].trim().replace(/^["']|["']$/g, '');

    // Read request body as a Buffer using arrayBuffer()
    const arrayBuffer = await req.arrayBuffer();
    const bodyBuffer = Buffer.from(arrayBuffer);

    // Parse multipart body
    const parsed = parseMultipart(bodyBuffer, boundary);
    const file = parsed.files['file'];
    const habitId = parsed.fields['habit_id'];
    const entryDate = parsed.fields['entry_date'];

    if (!file || !habitId || !entryDate) {
      return err('Missing file, habit_id, or entry_date', 422);
    }

    // Verify the habit belongs to this user
    const { data: habit, error: habitErr } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single();

    if (habitErr || !habit) {
      return err('Habit not found', 404);
    }

    // Ensure temp directory exists inside workspace
    const workspaceRoot = process.cwd();
    const tempDir = path.join(workspaceRoot, 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write input file to disk
    const fileHash = crypto.randomBytes(16).toString('hex');
    const inputExt = path.extname(file.filename) || '.mov';
    inputPath = path.join(tempDir, `in-${fileHash}${inputExt}`);
    outputPath = path.join(tempDir, `out-${fileHash}.mp4`);

    fs.writeFileSync(inputPath, file.data);

    // Transcode using FFmpeg:
    // -c:v libx264: H.264 video codec
    // -preset superfast: quick transcoding
    // -crf 30: medium-low quality for very small file size
    // -vf "scale='min(480,iw)':-2": scale down to max width 480px preserving aspect ratio
    // -c:a aac -b:a 64k: highly compressed AAC audio
    // -map 0:v:0 -map 0:a?: map first video track, and audio track if it exists (prevents failure if no audio)
    // -movflags +faststart: optimize for fast web loading
    const ffmpegCmd = `ffmpeg -i "${inputPath}" -c:v libx264 -preset superfast -crf 30 -vf "scale='min(480,iw)':-2" -c:a aac -b:a 64k -map 0:v:0 -map 0:a? -movflags +faststart -y "${outputPath}"`;

    try {
      await execPromise(ffmpegCmd);
    } catch (ffmpegErr: any) {
      console.error('[FFmpeg transcode error]', ffmpegErr);
      return err(`Video conversion failed: ${ffmpegErr.message || 'FFmpeg process error'}`, 500);
    }

    // Read the transcoded video file
    if (!fs.existsSync(outputPath)) {
      return err('Failed to produce converted MP4 file', 500);
    }
    const outputBuffer = fs.readFileSync(outputPath);

    // Upload the transcoded MP4 to Supabase Storage
    const safeName = file.filename.replace(/[^\w.\-]+/g, '_').replace(/\.[^/.]+$/, '') + '.mp4';
    const storagePath = `${user.id}/${habitId}-${entryDate}-${Date.now()}-${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from('habit-videos')
      .upload(storagePath, outputBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadErr) {
      console.error('[Supabase Storage upload error]', uploadErr);
      return err(`Failed to upload transcoded video: ${uploadErr.message}`, 500);
    }

    // Save entry in Database
    const now = new Date().toISOString();
    const { data: entry, error: dbErr } = await supabase
      .from('habit_entries')
      .upsert({
        habit_id: habitId,
        user_id: user.id,
        entry_date: entryDate,
        is_completed: true,
        video_path: storagePath,
        updated_at: now,
      }, { onConflict: 'habit_id,entry_date' })
      .select()
      .single();

    if (dbErr) {
      console.error('[Database update error]', dbErr);
      return err(`Failed to update habit entry: ${dbErr.message}`, 500);
    }

    return ok(entry);
  } catch (e: any) {
    console.error('[Transcode route unexpected error]', e);
    return err(e.message || 'An unexpected error occurred during processing', 500);
  } finally {
    // Cleanup temporary files
    try {
      if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (cleanupErr) {
      console.error('[FFmpeg cleanup error]', cleanupErr);
    }
  }
}
