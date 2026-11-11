# AI MTM · AURA AI + TechSpace

Công ty công nghệ AI độc lập hoàn toàn, gồm một Giám đốc thật và các phòng ban AI Agent ảo.

## Hai giao diện
- `/`: **AURA AI** — ứng dụng hội thoại tiếng Việt, nhập giọng nói và đọc trả lời, danh sách nhiệm vụ và đội ngũ AI.
- `/workspace/`: **TechSpace 1.1** — không gian công ty, dự án, bảng Kanban, phiếu điều hành, lịch, tài liệu, CRM và báo cáo. Đây là bản mẫu **cục bộ trên trình duyệt**, không có nhân sự hoặc AI thực thi.
- `/api/session` và `/api/chat`: API đăng nhập bằng cookie HttpOnly và kết nối mô hình qua Vercel AI Gateway phía máy chủ.

## Tình trạng
- AURA tạo lời tư vấn thực sự **khi** AI Gateway có quyền và ngân sách sử dụng; các phòng AI không tự chạy nhiệm vụ bên ngoài.
- Lịch sử chat/nhiệm vụ và dữ liệu TechSpace lưu tại **thiết bị** chứ chưa đồng bộ.
- Giọng nói dựa Web Speech API hoặc cầu nối Android của APK tương thích.
- Không ghi hoặc chia sẻ dữ liệu với hệ thống giáo dục, phần mềm hay cơ sở dữ liệu khác.

## Cấu hình Vercel
Biến môi trường, **không commit giá trị bí mật**:
- `AURA_ACCESS_CODE` — mã quản trị bảo mật.
- `AURA_SESSION_SECRET` — bí mật ký cookie.
- `AURA_MODEL` — `google/gemini-3.1-flash-lite`.
- `AI_GATEWAY_API_KEY` (nếu không dùng OIDC do Vercel cung cấp).

**Bảo mật:** mã truy cập độ ngẫu nhiên cao; hạn chế thử mã bằng rate limiting/WAF nếu dùng rộng rãi. Không chia sẻ mật khẩu. TechSpace là trang demo truy cập công khai (chỉ dữ liệu mẫu), không lưu thông tin nhạy cảm tại đây. Việc tăng quyền tự động thực thi phải có phân quyền, nhật ký và cơ chế phê duyệt.

## Xuất bản
Kết nối GitHub `thiebithocsovn/sofwareaiMTM` với một Vercel project **mới**, sử dụng thư mục gốc, framework `Other` (Node serverless functions). Cần HTTPS để micro có thể hoạt động.

## Android
APK AURA dùng trình duyệt trong ứng dụng và kết nối URL đã xuất bản; nhận giọng nói Android khi nhấn micro. Không chạy thường trực khi ứng dụng đóng hoặc màn hình khóa.