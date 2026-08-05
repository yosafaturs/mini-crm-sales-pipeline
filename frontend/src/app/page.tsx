import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="bg-blue-600 p-8 md:p-12 flex flex-col justify-center text-white">
            <div className="text-5xl mb-4">🏢</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Mini CRM</h1>
            <p className="text-blue-100 text-lg mb-6">
              Sales Pipeline Tracker dengan Real-time Kanban Board
            </p>
            <div className="space-y-2 text-sm text-blue-200">
              <p>✅ Next.js 14 + NestJS</p>
              <p>✅ PostgreSQL + Prisma</p>
              <p>✅ Socket.io Real-time</p>
              <p>✅ JWT Authentication + RBAC</p>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Selamat Datang!</h2>
            <p className="text-gray-600 mb-6">
              Silakan login untuk mengakses dashboard atau daftar akun baru.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                Daftar Akun Baru
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
              Demo: admin@crm.com / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}