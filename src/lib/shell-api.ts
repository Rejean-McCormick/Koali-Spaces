import type {ShellState} from '@/types/contracts';
const EMPTY:ShellState={state:'loading',network_state:'unknown',active_space:null,active_theme:null,modules:[],active_module_id:null,active_route_id:null,capabilities:[],reason:null};
export async function loadShellState():Promise<ShellState>{try{const r=await fetch('/api/shell-state',{cache:'no-store'});if(!r.ok)throw new Error(String(r.status));return await r.json();}catch{return {...EMPTY,state:'unavailable',reason:'local control state unavailable'};}}
