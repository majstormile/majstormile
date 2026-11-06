import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Old German addresses of the legal pages keep working (links in emails, Google and Meta settings).
  async redirects() { return [
    {source: '/impressum', destination: '/podaci-o-pruzaocu-usluge', permanent: true},
    {source: '/datenschutz', destination: '/politika-privatnosti', permanent: true},
  ]; },
  async headers() { return [{ source: '/(.*)', headers: [
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'Permissions-Policy',value:'geolocation=(self), camera=(self), microphone=()'}
  ]}]; }
};
export default nextConfig;
