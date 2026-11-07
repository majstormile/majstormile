// Admin inbox for support requests: list, change status, add internal notes.
import {z} from 'zod';
import {context,failure} from '@/lib/context';
import {AppError} from '@/lib/actions';
import {listRequests,updateRequest,SUPPORT_STATUSES} from '@/lib/support-store';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};

async function admin(req:Request){const c=await context(req);if(c.actual.role!=='Admin')throw new AppError('Only administrators can see support requests.',403);return c}

export async function GET(req:Request){try{await admin(req);return Response.json({requests:await listRequests()},{headers})}catch(e){return failure(e)}}

export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new AppError('Origin mismatch',403);
 const c=await admin(req);
 let b:{id:string,status?:typeof SUPPORT_STATUSES[number],notes?:string};
 try{b=z.object({id:z.string().uuid(),status:z.enum(SUPPORT_STATUSES).optional(),notes:z.string().max(8000).optional()}).parse(await req.json())}catch{throw new AppError('Invalid request.')}
 await updateRequest(b.id,{status:b.status,notes:b.notes},c.actual.name);
 return Response.json({requests:await listRequests()},{headers});
}catch(e){return failure(e)}}
