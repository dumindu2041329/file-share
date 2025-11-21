import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    try {
      await insforge.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=no_code', requestUrl.origin));
}
