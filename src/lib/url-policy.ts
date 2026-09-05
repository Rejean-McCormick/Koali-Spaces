export function isSafeLocalHref(path:string){return path.startsWith('/')&&!path.startsWith('//')&&!path.includes('://');}
export function normalizeLocalHref(path:string){if(!isSafeLocalHref(path))throw new Error('remote or invalid route rejected');return path.replace(/\/{2,}/g,'/');}
