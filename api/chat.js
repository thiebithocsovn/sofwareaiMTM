import {isAuthorized} from './_auth.js';

// AURA MTM's no-card free mode uses OpenRouter's free model router.
// There is no AI Gateway fallback: an account billing verification failure
// must not force the user into a paid provider or unexpected charges.
const prompt='Bạn là AURA AI, trợ lý Tổng Giám đốc của công ty công nghệ AI MTM độc lập tại Việt Nam. Giám đốc là con người DUY NHẤT. Tất cả Trưởng phòng, nhân viên là AI Agent: CTO, Research, Product, Business, Marketing, Finance, Legal, Quality. Tư vấn, lập chiến lược, phân chia kế hoạch, lập báo cáo khi đã có dữ liệu. Tuyệt đối không giả vờ có công cụ: bạn KHÔNG có quyền trực tiếp gửi việc, email, xuất bản, chi tiền, đăng nhập tài khoản, tự chạy trong nền hay theo dõi liên tục. Nói rõ đề xuất chưa thực hiện và yêu cầu phê duyệt khi có hậu quả bên ngoài. Không sử dụng hoặc suy đoán bất kỳ thông tin nào của dự án giáo dục khác. Trả lời bằng tiếng Việt, tự nhiên, chuyên nghiệp.';
const FREE_MODEL='openrouter/free';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST')return res.status(405).json({error:'Phương thức không hỗ trợ'});
  if(!isAuthorized(req))return res.status(401).json({error:'Vui lòng đăng nhập AURA'});
  let messages=req.body?.messages;
  if(!Array.isArray(messages)||messages.length<1||messages.length>25)return res.status(400).json({error:'Số lượng tin nhắn không hợp lệ'});
  messages=messages.map(m=>({role:m?.role,content:m?.content}));
  if(messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>6000)||messages[messages.length-1].role!=='user')return res.status(400).json({error:'Tin nhắn không hợp lệ'});
  const key=process.env.OPENROUTER_API_KEY?.trim();
  if(!key)return res.status(503).json({error:'AURA đang dùng chế độ AI miễn phí nhưng chưa có khóa OpenRouter. Tạo khóa tại https://openrouter.ai/settings/keys, sau đó thêm biến OPENROUTER_API_KEY trong Vercel → Project → Settings → Environment Variables → Production và triển khai lại.'});
  try{
    const response=await fetch('https://openrouter.ai/api/v1/chat/completions',{
      method:'POST',
      headers:{
        'Authorization':`Bearer ${key}`,
        'Content-Type':'application/json',
        'HTTP-Referer':'https://aura-ai-director.vercel.app',
        'X-OpenRouter-Title':'AURA AI MTM'
      },
      body:JSON.stringify({model:FREE_MODEL,messages:[{role:'system',content:prompt},...messages],max_tokens:1200,stream:false}),
      signal:AbortSignal.timeout(45000)
    });
    const data=await response.json().catch(()=>null);
    if(!response.ok){
      const errorCode=String(data?.error?.code||data?.error?.type||'').slice(0,50);
      console.error('AURA free AI provider rejected request',{status:response.status,code:errorCode});
      if(response.status===401||response.status===403)return res.status(503).json({error:'Khóa OpenRouter chưa hợp lệ hoặc chưa được cấp quyền. Hãy kiểm tra khóa OPENROUTER_API_KEY trong Vercel.'});
      if(response.status===429)return res.status(429).json({error:'Đã chạm giới hạn lượt gọi miễn phí của OpenRouter. Hãy thử lại sau khi hạn mức được làm mới.'});
      if(response.status===402)return res.status(503).json({error:'OpenRouter thông báo hạn mức tài khoản không đủ. Hãy kiểm tra mô hình miễn phí và hạn mức tài khoản; AURA không tự chuyển sang mô hình trả phí.'});
      return res.status(502).json({error:'Dịch vụ AI miễn phí tạm thời chưa khả dụng. Hãy thử lại sau.'});
    }
    const reply=data?.choices?.[0]?.message?.content;
    if(typeof reply!=='string'||!reply.trim())return res.status(502).json({error:'AI miễn phí trả về kết quả rỗng, hãy thử lại.'});
    return res.status(200).json({reply:reply.slice(0,16000)});
  }catch(error){
    if(error?.name==='AbortError'||error?.name==='TimeoutError')return res.status(504).json({error:'AI miễn phí phản hồi quá thời gian, hãy thử lại.'});
    console.error('AURA free AI connection error',String(error?.name||'ConnectionError').slice(0,40));
    return res.status(502).json({error:'Không kết nối được tới OpenRouter. Hãy kiểm tra lại sau.'});
  }
}
