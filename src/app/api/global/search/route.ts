import { NextResponse } from 'next/server';
import { executeSearchProviders } from '@/lib/global-providers/execute.server';
import { readServerShellState } from '@/lib/shell-state.server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (query.length > 200) return NextResponse.json({ error: 'query_too_long' }, { status: 400 });
  if (!query) return NextResponse.json({ query, results: [] });
  const state = await readServerShellState();
  if (state.state === 'unavailable') return NextResponse.json({ query, results: [], state: 'unavailable' }, { status: 503 });
  const results = await executeSearchProviders(state, query);
  return NextResponse.json({ query, results });
}
