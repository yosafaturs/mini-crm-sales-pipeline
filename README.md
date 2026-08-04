#  Mini CRM & Sales Pipeline Tracker

> Aplikasi manajemen penjualan (CRM) dengan Kanban board real-time. Dibuat untuk portfolio sebagai Full-Stack Developer.

## 🛠️ Tech Stack

| Bagian | Teknologi |
|--------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Socket.io Client |
| Backend | NestJS, TypeScript, Socket.io, JWT |
| Database | PostgreSQL, Prisma ORM |
| Real-time | Socket.io |

##  Fitur Utama

-  **Login & Keamanan**: JWT dengan HTTP-only cookies, password di-hash dengan bcrypt
-  **Role-Based Access**: Admin bisa lihat semua, Sales cuma lihat deal sendiri
-  **Kanban Board**: Drag & drop kartu antar 6 stage pipeline
-  **Real-time Sync**: Perubahan langsung terlihat oleh semua user (Socket.io)
-  **Dashboard Metrics**: Total revenue per stage (di-hitung otomatis)
-  **Audit Trail**: Catatan interaksi (CALL, EMAIL, MEETING, NOTE)
-  **Auto Alert**: Cron job cek deal yang >4 hari tanpa aktivitas

##  Cara Menjalankan

### Prasyarat
- Node.js 18+
- PostgreSQL

1. Clone Repository
```bash
git clone https://github.com/yosafaturs/mini-crm-sales-pipeline.git
cd mini-crm-sales-pipeline

2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
npx prisma db push
npx prisma db seed
npm run start:dev

3. Setup Frontend
cd frontend
npm install
npm run dev

4. Buka Web
http://localhost:3000

5. Akun Demo
Role	Email	Password
Admin Manager	admin@crm.com	password123
Sales Executive	alice@crm.com	password123
Sales Executive	bob@crm.com	password123


STRUKTUR PROJECT
mini-crm/
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── auth/     # Login, JWT, Guard
│   │   ├── deals/    # CRUD deal, Kanban logic
│   │   ├── interactions/ # Catatan interaksi
│   │   ├── socket/   # WebSocket gateway
│   │   └── cron/     # Auto alert (cron job)
│   └── prisma/       # Database schema
└── frontend/         # Next.js frontend
    ├── src/app/      # Halaman web
    └── src/components/ # Komponen UI