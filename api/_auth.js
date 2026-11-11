import {createHmac,timingSafeEqual} from 'node:crypto';
const TTL=30*24*60*60;
const equal=(a,b)=>{const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y)};
const mac=s=>createHmac('sha256',process.env.AURA_SESSION_SECRET||'').update(s).digest('base64url');
export const configured=()=>!!(process.env.AURA_ACCESS_CODE&&process.env.AURA_SESSION_SECRET);
export const aiReady=()=>!!(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN);
export const validCode=code=>configured()&&equal(code,process.env.AURA_ACCESS_CODE);
export function isAuthorized(req){if(!configured())return false;let m=String(req.headers.cookie||'').match(/(?:^|;\s*)aura_session=([^;]+)/);if(!m)return false;const [stamp,signature]=m[1].split('.');if(!stamp||!signature||!equal(mac(stamp),signature))return false;const expiry=Number(stamp),now=Date.now();return Number.isSafeInteger(expiry)&&expiry>now&&expiry<=now+TTL*1000+60000}
export function makeCookie(){const expiry=String(Date.now()+TTL*1000);return 'aura_session='+expiry+'.'+mac(expiry)+'; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age='+TTL}
export const clearCookie=()=> 'aura_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';