'use client';
// Cookie and device-storage policy. Keep the table in step with what the app actually stores
// (lib/i18n.tsx, app/workspace.tsx, lib/offline-queue.ts, public/sw.js, components/ui/sidebar.tsx, Supabase Auth).
import {operator as o} from '@/lib/legal';
import LegalPage, {Fill} from '@/components/legal-page';

const STORED: [string, string, string, string][] = [
  ['Sesija prijave (sb-…-auth-token)', 'Lokalno skladište pregledača', 'Drži vas prijavljenim; bez nje prijava nije moguća.', 'Do odjave ili isteka sesije'],
  ['Vreme prijave (majstormile-login-at)', 'Lokalno skladište', 'Automatska odjava posle 24 sata, radi bezbednosti.', 'Do odjave'],
  ['Jezik (majstormile-lang)', 'Lokalno skladište', 'Pamti izabrani jezik.', 'Dok ga ne obrišete'],
  ['Tema (majstormile-theme)', 'Lokalno skladište', 'Pamti svetlu ili tamnu temu.', 'Dok je ne obrišete'],
  ['Bočna traka (sidebar_state)', 'Kolačić', 'Pamti da li je bočna traka otvorena.', '7 dana'],
  ['Izmene van mreže (majstormile-offline)', 'IndexedDB', 'Čuva izmene unete bez interneta dok se ne pošalju.', 'Do slanja ili odjave'],
  ['Kopija aplikacije i poslednjeg radnog prostora', 'Keš servis-radnika (service worker)', 'Omogućava otvaranje aplikacije i rad bez signala.', 'Do sledećeg ažuriranja ili odjave'],
];

export default function CookiePolicy() {
  return <LegalPage title="Politika kolačića" sections={[
    {h: '1. Ukratko', p: [
      'MajstorMile ne koristi kolačiće za praćenje, analitiku ni reklame i ne deli podatke sa oglašivačima. Na vašem uređaju čuva se samo ono što je neophodno da bi usluga koju ste zatražili radila: prijava, podešavanja i rad bez interneta.',
      'Zbog toga ne prikazujemo baner za saglasnost. Ako ikada uvedemo kolačiće koji nisu neophodni, tražićemo vašu prethodnu saglasnost i ažurirati ovu politiku.',
    ]},
    {h: '2. Šta se čuva na vašem uređaju', p: [
      <div key="t" className="legal-table-wrap"><table className="legal-table">
        <thead><tr><th>Naziv</th><th>Vrsta</th><th>Svrha</th><th>Trajanje</th></tr></thead>
        <tbody>{STORED.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
      </table></div>,
    ]},
    {h: '3. Veb analitika', p: [
      'Posete stranicama brojimo pomoću Vercel Web Analytics. Ova usluga ne postavlja kolačiće i ne čuva ništa na vašem uređaju; posetioci se razlikuju samo po heš vrednosti koja se menja svakog dana.',
    ]},
    {h: '4. Prijava preko Google ili Facebook naloga', p: [
      'Ako izaberete prijavu preko Google ili Facebook naloga, prelazite na stranicu tog servisa, koji tada može da postavi sopstvene kolačiće prema svojim pravilima. MajstorMile te kolačiće ne čita.',
    ]},
    {h: '5. Kako da obrišete sačuvane podatke', p: [
      'Odjavom se brišu sesija, izmene van mreže i kopija radnog prostora. Sve ostalo možete obrisati u podešavanjima pregledača (brisanje podataka sajta za majstormile.com). Posle brisanja ponovo izaberite jezik i temu.',
    ]},
    {h: '6. Kontakt', p: [<>Pitanja u vezi sa ovom politikom pošaljite na <Fill value={o.email} label="e-pošta"/>.</>]},
  ]}/>;
}
