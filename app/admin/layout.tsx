import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">MK-Ops License</h1>
          <p className="text-sm text-gray-500">Painel Administrativo</p>
        </div>

        <nav className="px-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <span>📊</span>
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/admin/licenses"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <span>📄</span>
            <span className="font-medium">Licenças</span>
          </Link>

          <Link
            href="/admin/validation-logs"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <span>📋</span>
            <span className="font-medium">Logs de Validação</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 border-t bg-white p-4">
          <p className="text-xs text-gray-500">
            Versão 1.0 • {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
