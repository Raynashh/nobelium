import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const filePathArray = resolvedParams.path;
  if (!filePathArray || filePathArray.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Prevent directory traversal
  const safePathArray = filePathArray.filter(segment => !segment.includes('..') && segment !== '');
  const filePath = path.join(process.cwd(), 'public', 'uploads', ...safePathArray);
  
  try {

    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Not Found', { status: 404 });
  }
}
