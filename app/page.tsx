'use client';
// Home page: the public product page. Signed-in users and sign-in links (Google, Facebook,
// password reset, invitations) are forwarded to the workspace, so all auth redirects can keep using the bare domain.
import {useEffect} from 'react';
import Concept from './concept/page';

const WORKSPACE = '/radni-prostor';
function hasSession() {
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) || ''; if (k.startsWith('sb-') && k.endsWith('-auth-token')) return true; } } catch {}
  return false;
}
export default function Home() {
  useEffect(() => {
    const {search, hash} = window.location;
    const authLink = /[?&](code|token_hash|error_description)=/.test(search) || /access_token=|error_description=|type=(recovery|invite|signup|magiclink)/.test(hash);
    if (authLink || hasSession()) window.location.replace(WORKSPACE + search + hash);
  }, []);
  return <Concept/>;
}
