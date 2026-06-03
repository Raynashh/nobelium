import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const filePathArray = resolvedParams.path;
  if (!filePathArray || filePathArray.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Prevent directory traversal
  const safePathArray = filePathArray.filter(segment => !segment.includes('..') && segment !== '');
  
  // Construct the new public R2 URL
  const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://nobelium.cdn.ddbrother.me";
  const redirectUrl = `${r2PublicUrl}/uploads/${safePathArray.join('/')}`;

  // Issue a 301 Permanent Redirect to offload traffic directly to the CDN
  return NextResponse.redirect(redirectUrl, 301);
}
