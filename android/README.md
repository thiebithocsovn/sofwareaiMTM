# AURA AI MTM — Android APK thử nghiệm

- `apk/AURA-AI-MTM-v1.apk` — ứng dụng APK đã biên dịch bằng Android SDK 35, hỗ trợ Android 8.0 trở lên (minSdk 26).
- `src/vn/mtm/aura/MainActivity.java` — mã nguồn Android (WebView HTTPS, SpeechRecognizer tiếng Việt và TextToSpeech).
- `AndroidManifest.xml` — các quyền mạng và micro.

Ứng dụng mở trang riêng `https://softwareai-mtm.vercel.app/`. Nhấn biểu tượng micro để nhận giọng nói; giọng nói được chuyển thành tin nhắn trên máy chủ AURA. Cần kết nối mạng, đăng nhập bằng mã AURA và quyền AI Gateway hoạt động. Micro chỉ nghe khi nhấn nút, không nghe nền.

APK được **ký thử nghiệm**, không phải bản phát hành qua Google Play, chưa thử trực tiếp trên thiết bị vật lý. Khóa ký thử nghiệm không lưu trong kho GitHub nên bản phát hành tiếp theo có thể cần gỡ bản này trước khi cài. Không dùng APK này để phân phối thương mại nếu chưa có khóa ký release cố định và đánh giá bảo mật.

SHA-256 của APK: `6a2697c8b88566c2427af8fd513a833aaa2f0ea1f45b14a7b9f6df3857e912c2`.
