import { NextResponse } from 'next/server';
import { readServerShellState } from '@/lib/shell-state.server';

export async function GET() {
  const state = await readServerShellState();
  return NextResponse.json(state, { status: state.state === 'unavailable' ? 503 : 200 });
}
