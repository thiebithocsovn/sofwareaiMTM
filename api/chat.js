import {isAuthorized,aiReady} from './_auth.js';
const prompt='Bạn là AURA AI, trợ lý Tổng Giám đốc của công ty công nghệ AI MTM độc lập tại Việt Nam. Giám đốc là con người DUY NHẤT. Tất cả Trưởng phòng, nhân viên là AI Agent: CTO, Research, Product, Business, Marketing, Finance, Legal, Quality. Tư vấn, lập chiến lược, phân chia kế hoạch, lập báo cáo khi đã có dữ liệu. Tuyệt đối không giả vờ có công cụ: bạn KHÔNG có quyền trực tiếp gửi việc, email, xuất bản, chi tiền, đăng nhập tài khoản, tự chạy trong nền hay theo dõi liên tục. Nói rõ đề xuất chưa thực hiện và yêu cầu phê duyệt khi có hậu quả bên ngoài. Không sử dụng hoặc suy đoán bất kỳ thông tin nào của dự án giáo dục khác. Trả lời bằng tiếng Việt, tự nhiên, chuyên nghiệp.';
export default async function handler(req,res){
res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
if(req.method!=='POST')return res.status(405).json({error:'Phương thức không hỗ trợ'});
if(!isAuthorized(req))return res.status(401).json({error:'Vui lòng đăng nhập AURA'});
if(!aiReady())return res.status(503).json({error:'Chưa cấu hình dịch vụ AI Gateway trên máy chủ.'});
let messages=req.body?.messages;
if(!Array.isArray(messages)||!messages.length||messages.length>25)return res.status(400).json({error:'Số lượng tin nhắn không hợp lệ'});
messages=messages.map(m=>({role:m?.role,content:m?.content}));
if(messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>6000)||messages.at(-1).role!=='user')return res.status(400).json({error:'Tin nhắn không hợp lệ'});
const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),45000);
try{const token=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
const response=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',signal:ctrl.signal,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.AURA_MODEL||'google/gemini-3.1-flash-lite',messages:[{role:'system',content:prompt},...messages],max_tokens:1200})});
const data=await response.json().catch(()=>({}));
if(!response.ok){console.error('AURA upstream status',response.status,data?.error?.code||'unknown');return res.status(response.status===429?429:502).json({error:response.status===429?'Hệ thống AI đã chạm giới hạn truy cập.':'Chưa kết nối thành công tới AI Gateway. Kiểm tra quyền truy cập và ngân sách.'})}
const reply=data?.choices?.[0]?.message?.content;
if(typeof reply!=='string'||!reply.trim())return res.status(502).json({error:'AI trả về kết quả không hợp lệ'});
return res.status(200).json({reply:reply.slice(0,16000)})
}catch(e){console.error('AURA chat failure',e?.name||'unknown');return res.status(502).json({error:e?.name==='AbortError'?'AI phản hồi quá thời gian.':'Không thể nhận phản hồi AI.'})}finally{clearTimeout(timer)}
}