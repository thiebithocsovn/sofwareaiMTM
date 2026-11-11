import {isAuthorized} from './_auth.js';
import {generateText} from 'ai';
const prompt='Bạn là AURA AI, trợ lý Tổng Giám đốc của công ty công nghệ AI MTM độc lập tại Việt Nam. Giám đốc là con người DUY NHẤT. Tất cả Trưởng phòng, nhân viên là AI Agent: CTO, Research, Product, Business, Marketing, Finance, Legal, Quality. Tư vấn, lập chiến lược, phân chia kế hoạch, lập báo cáo khi đã có dữ liệu. Tuyệt đối không giả vờ có công cụ: bạn KHÔNG có quyền trực tiếp gửi việc, email, xuất bản, chi tiền, đăng nhập tài khoản, tự chạy trong nền hay theo dõi liên tục. Nói rõ đề xuất chưa thực hiện và yêu cầu phê duyệt khi có hậu quả bên ngoài. Không sử dụng hoặc suy đoán bất kỳ thông tin nào của dự án giáo dục khác. Trả lời bằng tiếng Việt, tự nhiên, chuyên nghiệp.';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST')return res.status(405).json({error:'Phương thức không hỗ trợ'});
  if(!isAuthorized(req))return res.status(401).json({error:'Vui lòng đăng nhập AURA'});
  let messages=req.body?.messages;
  if(!Array.isArray(messages)||messages.length<1||messages.length>25)return res.status(400).json({error:'Số lượng tin nhắn không hợp lệ'});
  messages=messages.map(m=>({role:m?.role,content:m?.content}));
  if(messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>6000)||messages[messages.length-1].role!=='user')return res.status(400).json({error:'Tin nhắn không hợp lệ'});
  try{
    // The AI SDK authenticates automatically through Vercel's project-scoped OIDC.
    // Optional AI_GATEWAY_API_KEY is read by the SDK on environments without OIDC.
    // Neither credential is exposed to the browser or stored in the repository.
    const result=await generateText({
      model:process.env.AURA_MODEL||'google/gemini-3.1-flash-lite',
      system:prompt,
      messages,
      maxOutputTokens:1200,
      abortSignal:AbortSignal.timeout(45000),
      maxRetries:0
    });
    const reply=result.text;
    if(typeof reply!=='string'||!reply.trim())return res.status(502).json({error:'AI trả về kết quả rỗng, hãy thử lại'});
    return res.status(200).json({reply:reply.slice(0,16000)});
  }catch(error){
    const status=Number(error?.statusCode||error?.status||error?.response?.status||0);
    const code=String(error?.name||'GatewayError');
    const upstream=(()=>{try{const body=JSON.parse(String(error?.responseBody||error?.cause?.responseBody||'{}'));return {type:String(body?.error?.type||'').slice(0,60),code:String(body?.error?.code||'').slice(0,60),message:String(body?.error?.message||'').slice(0,100)}}catch{return {type:'unparsed'}}})();
    console.error('AURA AI Gateway request failed',status,code,JSON.stringify(upstream));
    if(status===429)return res.status(429).json({error:'Dịch vụ AI đang giới hạn lượt gọi. Vui lòng thử lại.'});
    if(status===401||status===403)return res.status(503).json({error:'AI Gateway chưa cấp quyền cho dự án. Hãy kiểm tra OIDC trong Vercel → Settings → Security.'});
    if(status===402)return res.status(503).json({error:'AI Gateway chưa có ngân sách hoặc hạn mức sử dụng.'});
    if(code.includes('Abort')||code.includes('Timeout'))return res.status(504).json({error:'AI phản hồi quá thời gian.'});
    return res.status(502).json({error:'AI Gateway chưa trả lời được. Vui lòng kiểm tra Logs và ngân sách của dự án Vercel.'});
  }
}
