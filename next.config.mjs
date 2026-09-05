/** @type {import('next').NextConfig} */
const nextConfig={output:'standalone',poweredByHeader:false,images:{unoptimized:true},async headers(){return [{source:'/:path*',headers:[{key:'Content-Security-Policy',value:"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'"},{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'}]}]}};
export default nextConfig;
