export function permits(required:string[]|undefined,available:Iterable<string>){const set=new Set(available);return (required??[]).every(x=>set.has(x));}
