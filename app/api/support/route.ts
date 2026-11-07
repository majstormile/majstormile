// Public support form (no sign-in): sends the request to info@majstormile.com via Resend.
import {z} from 'zod';
import {sendMail,makeLimiter} from '@/lib/mail';
import {saveRequest} from '@/lib/support-store';
export const runtime='nodejs';export const dynamic='force-dynamic';

const limiter=makeLimiter(3,10*60_000);
const headers={'Cache-Control':'private, no-store'};
const oneLine=(s:string)=>s.replace(/[\r\n]+/g,' ').trim();
const fail=(error:string,status:number)=>Response.json({error},{status,headers});

export async function POST(req:Request){
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return fail('Origin mismatch',403);
 const raw=await req.text();if(new TextEncoder().encode(raw).length>16384)return fail('Request too large',413);
 let f:{name:string,email:string,phone?:string,topic:string,message:string,website?:string};
 try{f=z.object({name:z.string().trim().min(1).max(120),email:z.string().trim().email().max(200),phone:z.string().trim().max(40).optional(),topic:z.string().trim().max(60),message:z.string().trim().min(5).max(4000),website:z.string().max(200).optional()}).parse(JSON.parse(raw))}
 catch{return fail('Enter your name, a valid email address, and a message of at least 5 characters.',400)}
 if(f.website)return Response.json({sent:true},{headers}); // honeypot: bots fill the hidden field
 const ip=(req.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'unknown';
 if(!limiter(ip,Date.now()))return fail('Please wait a few minutes before sending another message.',429);
 const ref='MM-'+Date.now().toString(36).toUpperCase().slice(-6);
 const to=process.env.SUPPORT_EMAIL?.trim()||'info@majstormile.com';
 // Saved in the support inbox (Platform → Support requests) and emailed to info@; either one is enough.
 let saved=false;try{await saveRequest({ref,name:oneLine(f.name),email:oneLine(f.email),phone:f.phone?oneLine(f.phone):undefined,topic:oneLine(f.topic),message:f.message});saved=true}catch(e){console.error('Support request not saved:',e)}
 const r=await sendMail({to,replyTo:oneLine(f.email),
  subject:`[${ref}] ${oneLine(f.topic)}: ${oneLine(f.name).slice(0,80)}`,
  text:f.message+'\n\n---\nTicket: '+ref+'\nName: '+oneLine(f.name)+'\nEmail: '+oneLine(f.email)+(f.phone?'\nPhone: '+oneLine(f.phone):'')+'\nTopic: '+oneLine(f.topic)});
 if(!r.ok)console.error('Support ticket email failed:',r.reason,'detail' in r?r.detail:'');
 if(r.ok||saved)return Response.json({sent:true,ref},{headers});
 return fail('Your message could not be sent right now. Please try again later.',503);
}
