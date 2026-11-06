import 'server-only';
import {authenticatedUser,readWorkspace,saveWorkspace} from './store';
import {syncMemberEmail} from './users';
import {canSee,isActive,type State,type Member} from './domain';
import {contractorView} from './jobs';
import {AppError} from './actions';
import {mailReady} from './mail';
import {bindSsoMember,ssoPolicy} from './sso';
export async function context(req:Request){
 const user=await authenticatedUser(req),row=await readWorkspace(user),state=row.data;
 let actual=state.members.find(m=>!m.demo&&isActive(m)&&(m.authUserId===user.userId||m.id===user.userId));
 // First SSO sign-in: bind the waiting SSO membership with this email, then save before anything else happens.
 if(!actual){const bound=bindSsoMember(state,user,new Date().toISOString(),ssoPolicy());if(bound){if(!await saveWorkspace(state,row.revision))throw new AppError('Workspace changed. Refresh and try again.',409);row.revision+=1;actual=bound}}
 if(!actual)throw new AppError('Your account has not been approved for this workspace. Ask your administrator for access.',403);
 if(syncMemberEmail(state,actual,user.email,new Date().toISOString())&&await saveWorkspace(state,row.revision))row.revision+=1;
 const preview=new URL(req.url).searchParams.get('persona');
 const member=actual.role==='Admin'&&preview?state.members.find(m=>m.id===preview&&isActive(m)):actual;
 if(!member)throw new AppError('Preview member unavailable.',404);
 return {row,state,member,actual,user};
}
export function project(s:State,m:Member,admin:boolean){
 const tickets=s.tickets.filter(t=>canSee(t,m)).map(t=>m.role==='Contractor'?contractorView(t,m):t);
 const ids=new Set(tickets.map(t=>t.id));
 const members=s.members.filter(x=>['Admin','Auditor','Head Analyst','Director'].includes(m.role)||x.id===m.id).map(x=>({...x,email:['Admin','Head Analyst','Director'].includes(m.role)?x.email:'',authUserId:['Admin','Head Analyst','Director'].includes(m.role)?x.authUserId:undefined}));
 return {...s,tickets,members,rolePermissions:s.rolePermissions||{},branding:s.branding||{},teamProfiles:s.teamProfiles||{},teams:['Admin','Auditor'].includes(m.role)?s.teams:(m.teams||[]),contracts:s.contracts.filter(c=>m.role!=='Contractor'||c.contractor===m.contractor),notifications:s.notifications.filter(n=>(m.role==='Admin'||n.recipient===m.id)&&ids.has(n.ticket)),events:['Admin','Auditor'].includes(m.role)?s.events:[],viewer:{...m,authUserId:undefined},mail:{ready:mailReady()},outbox:m.role==='Admin'?(s.outbox||[]).slice(0,20).map(i=>({...i,text:''})):[],canPreview:admin,personas:admin?s.members.filter(isActive).map(x=>({id:x.id,name:x.name,role:x.role})):[]};
}
export function failure(e:unknown){let status=503,message='The operation could not be completed. Your unsaved input is retained; retry or contact your administrator.';if(e instanceof AppError){status=e.status;message=e.message;}else if(e instanceof Error&&/^\d{3}:/.test(e.message)){status=Number(e.message.slice(0,3));message=e.message.slice(4);}return Response.json({error:message},{status,headers:{'Cache-Control':'private, no-store'}})}

