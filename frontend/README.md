This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Structure Project

frontend/
├── app/
│ ├── (auth)/ # Nhóm đăng nhập/đăng ký
│ │ ├── login/page.tsx
│ │ └── register/page.tsx
│ ├── (customer)/ # Luồng cho khách hàng (Bán kính)
│ │ ├── products/ # Danh sách & Chi tiết sản phẩm
│ │ │ ├── [id]/page.tsx # Trang chi tiết kính cụ thể
│ │ │ └── page.tsx
│ │ ├── cart/page.tsx # Giỏ hàng
│ │ ├── checkout/page.tsx # Thanh toán
│ │ └── page.tsx # Landing page
│ ├── (sales)/ # Quản lý đơn hàng, khách hàng cho Sales
│ ├── (operation)/ # Quản lý kho kính, vận chuyển
│ ├── (management)/ # Dashboard báo cáo doanh thu
│ ├── (admin)/ # Quản lý nhân viên, cấu hình hệ thống
│ ├── api/ # Route Handlers (nếu cần xử lý backend riêng)
│ ├── globals.css
│ ├── layout.tsx # Root layout (Font, Provider chung)
│ └── page.tsx # Trang điều hướng gốc
├── components/
│ ├── ui/ # Components nguyên tử (Button, Input, Modal)
│ ├── shared/ # Navbar, Footer dùng chung
│ ├── customer/ # Components riêng cho khách (ProductCard, Filter)
│ └── admin/ # Components riêng cho quản trị (AdminSidebar, Charts)
├── services/ # MỚI: Nơi chứa logic gọi dữ liệu
│ ├── auth.service.ts # Xử lý login/logout với Supabase
│ ├── product.service.ts # Fetch danh sách kính, lọc theo dáng mặt
│ ├── order.service.ts # Tạo đơn hàng, cập nhật trạng thái
│ └── user.service.ts # Quản lý thông tin cá nhân
├── types/ # MỚI: Định nghĩa kiểu dữ liệu (TypeScript)
│ ├── product.ts # Interface: Lens, Frame, Brand
│ ├── order.ts # Interface: Order, OrderItem, PaymentStatus
│ ├── user.ts # Interface: Role (Admin, Sales, Customer)
│ └── common.ts # Các type chung như APIResponse, Pagination
├── lib/ # Thư viện & Cấu hình
│ ├── supabase.ts # Khởi tạo Supabase client
│ └── utils.ts # Hàm bổ trợ (format tiền tệ, xử lý chuỗi)
├── hooks/ # MỚI: Custom hooks (useCart, useAuth, useDebounce)
├── constants/ # Menu items, định nghĩa các hằng số
│ ├── menu.ts # Cấu hình sidebar cho từng Role
│ └── config.ts # Các cấu hình tĩnh khác
├── public/ # Images, Icons, SVG
├── middleware.ts # MỚI: Kiểm tra quyền truy cập (RBAC)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
