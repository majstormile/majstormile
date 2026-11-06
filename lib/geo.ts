import 'server-only';

const UA=`Baunavi/1 (${process.env.SUPPORT_EMAIL||process.env.OWNER_EMAIL||'contact unset'})`;
const EU='at,be,bg,hr,cy,cz,dk,ee,fi,fr,de,gr,hu,ie,it,lv,lt,lu,mt,nl,pl,pt,ro,sk,si,es,se';
export const COUNTRY_CODES:Record<string,string>={USA:'us',CAN:'ca',SRB:'rs',EU:EU,Europe:EU};

// Address suggestions only. Typed text goes to Photon (komoot GmbH, Germany); nothing is stored there by Baunavi.
// No other geocoding service is used, and jobs never store coordinates.

// Address type-ahead limited to one country, from Photon (OpenStreetMap data, built for search-as-you-type).
// Results are cached briefly per query so typing does not repeat requests.
export type Suggestion={label:string,lat:number,lng:number,street:string,city:string};
const suggestCache=new Map<string,{at:number,rows:Suggestion[]}>();
export async function suggestAddresses(q:string,opts:{country:string,bbox:[number,number,number,number],lang?:string,nearLat?:number,nearLng?:number}):Promise<Suggestion[]>{
 const key=[opts.country,opts.lang||'',q.toLowerCase(),opts.nearLat?.toFixed(2)||'',opts.nearLng?.toFixed(2)||''].join('|');
 const hit=suggestCache.get(key);if(hit&&Date.now()-hit.at<10*60_000)return hit.rows;
 const p=new URLSearchParams({q,limit:'12',bbox:opts.bbox.join(',')});
 if(opts.lang&&['en','fr','de','it'].includes(opts.lang))p.set('lang',opts.lang);
 if(typeof opts.nearLat==='number'&&typeof opts.nearLng==='number'){p.set('lat',String(opts.nearLat));p.set('lon',String(opts.nearLng))}
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),5000);
 let r:Response;
 try{r=await fetch('https://photon.komoot.io/api/?'+p.toString(),{headers:{'User-Agent':UA},cache:'no-store',signal:ctl.signal})}finally{clearTimeout(timer)}
 if(!r.ok)throw new Error('unavailable');
 const d:any=await r.json();
 const want=opts.country.toUpperCase();
 const rows:Suggestion[]=[];const seen=new Set<string>();
 for(const f of d?.features||[]){
  const pr=f?.properties||{};const [lng,lat]=f?.geometry?.coordinates||[];
  if(String(pr.countrycode||'').toUpperCase()!==want||!Number.isFinite(lat)||!Number.isFinite(lng))continue;
  const street=String(pr.street||(pr.osm_key==='highway'?pr.name:'')||'');
  const line1=pr.housenumber&&street?(want==='RS'?street+' '+pr.housenumber:pr.housenumber+' '+street):(pr.name&&pr.name!==street?[pr.name,street].filter(Boolean).join(', '):street||pr.name||'');
  const city=String(pr.city||pr.town||pr.village||pr.district||pr.county||'');
  const line2=[pr.postcode,city].filter(Boolean).join(' ');
  const label=[line1,line2,want==='CA'?pr.state:''].filter(Boolean).join(', ');
  if(!label||seen.has(label))continue;seen.add(label);
  rows.push({label:label.slice(0,200),lat,lng,street:street.slice(0,150),city:city.slice(0,100)});
  if(rows.length>=6)break;
 }
 if(suggestCache.size>500)suggestCache.clear();
 suggestCache.set(key,{at:Date.now(),rows});
 return rows;
}
