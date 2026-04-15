# NCS Kudos Project Structure

Dự án đã được tái cấu trúc để tối ưu hóa việc bảo trì, mở rộng và tăng hiệu suất. Dưới đây là sơ đồ tổ chức mới:

## 📂 Thư mục chính

### 1. `/app` (Routing & Pages)
Chứa các "trang" chính của ứng dụng. Theo đúng chuẩn Next.js App Router:
- `page.tsx`: Màn hình Dashboard dành cho người dùng cuối.
- `/admin`: Các trang quản lý (Gifts, Users, Transactions).
- `/api`: Toàn bộ logic Backend, chia theo các endpoint rõ ràng.

### 2. `/components` (UI & Logic Giao diện)
Tất cả các thành phần HTML/React được bóc tách ra đây để tái sử dụng:
- `/dashboard`: Chứa các thành phần của màn hình chính (`DashboardHero`, `KudosForm`, `GamificationSidebar`, `LuckyWheel`).
- `/admin`: (Trong tương lai) Chứa các bảng và form quản trị.
- `/ui`: Các thành phần nguyên tử dùng chung (Buttons, Modals).

### 3. `/styles` (Tách biệt CSS)
Toàn bộ mã CSS được gom về đây thay vì để rải rác trong `app/`:
- `globals.css`: Phong cách chung toàn hệ thống.
- `dashboard.css`, `admin.css`, `login.css`: CSS riêng cho từng phân khu.

### 4. `/lib` (Core Logic & Infrastructure)
Nơi chứa các cấu hình "kế thừa" và dùng chung:
- `prisma.ts`: Singleton instance của Database Client (ngăn chặn lỗi rò rỉ kết nối).

### 5. `/prisma` (Database Schema)
Chứa định nghĩa bảng dữ liệu (`schema.prisma`) và lịch sử thay đổi.

---

## ⚡ Lợi ích của cấu trúc mới
- **Gọn nhẹ**: File `page.tsx` giảm từ 700 dòng xuống còn ~200 dòng.
- **Dễ bảo trì**: Sửa giao diện Form thì vào `KudosForm.tsx`, sửa logic Game thì vào `GamificationSidebar.tsx`.
- **Hiệu suất**: Database connection được quản lý tập trung, tránh overhead.
