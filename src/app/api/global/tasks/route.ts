import { NextResponse } from 'next/server';
import { executeTaskProviders } from '@/lib/global-providers/execute.server';
import { readServerShellState } from '@/lib/shell-state.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = await readServerShellState();
  if (state.state === 'unavailable') return NextResponse.json({ tasks: [], state: 'unavailable' }, { status: 503 });
  const tasks = await executeTaskProviders(state);
  return NextResponse.json({ tasks });
}
