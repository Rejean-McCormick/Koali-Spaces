import { NextResponse } from 'next/server';
import { readPublicEcosystemStatus } from '@/lib/ecosystem-status.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await readPublicEcosystemStatus(), {
    headers: { 'cache-control': 'no-store' },
  });
}
