import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const filePathArray = resolvedParams.path;
  if (!filePathArray || filePathArray.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const safePathArray = filePathArray.filter(segment => !segment.includes('..') && segment !== '');
  
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  const redirectUrl = `${r2PublicUrl}/uploads/${safePathArray.join('/')}`;

  return NextResponse.redirect(redirectUrl, 301);
}
