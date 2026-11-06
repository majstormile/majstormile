import type {MetadataRoute} from 'next';
import {instance} from '@/lib/instance';

// Lets field staff install Baunavi on a phone or tablet and open it like an app, including offline.
export default function manifest(): MetadataRoute.Manifest {
  const meta = instance.meta[instance.defaultLang] || instance.meta.en!;
  return {
    name: instance.brand,
    short_name: 'Baunavi',
    description: meta.description,
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#152a40',
    lang: instance.defaultLang,
    icons: [
      {src: `/icons/${instance.id}-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any'},
      {src: `/icons/${instance.id}-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any'},
      {src: `/icons/${instance.id}-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable'},
    ],
    shortcuts: [
      {name: 'Schaden melden', url: '/report', icons: [{src: `/icons/${instance.id}-192.png`, sizes: '192x192'}]},
    ],
  };
}
