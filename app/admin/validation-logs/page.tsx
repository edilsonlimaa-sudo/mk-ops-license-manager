"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

interface ValidationLog {
  id: string;
  mkAuthAddress: string;
  result: boolean;
  status: "active" | "expired" | "suspended" | "not_found";
  validatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ValidationLogsPage() {
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs(pagination.page);
  }, []);

  const fetchLogs = async (page: number) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "50",
    });
    if (search) params.set("mkAuthAddress", search);

    const res = await fetch(`/api/admin/validation-logs?${params}`);
    const data = await res.json();
    setLogs(data.logs);
    setPagination(data.pagination);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Logs de Validação</h1>
        <p className="mt-2 text-gray-600">
          Histórico de todas as validações de licenças realizadas pelos apps
        </p>
      </div>

      {/* Search */}
      <div className="rounded-lg border bg-white p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por endereço mk-auth..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-6 py-2 font-medium text-white hover:bg-gray-800"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Total de Validações</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Validações com Sucesso</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {logs.filter((l) => l.result).length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Validações Bloqueadas</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {logs.filter((l) => !l.result).length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nenhum log encontrado</div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Endereço mk-auth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Resultado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(log.validatedAt)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {log.mkAuthAddress}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={log.status as any} />
                  </td>
                  <td className="px-6 py-4">
                    {log.result ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        ✓ Acesso permitido
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                        ✗ Acesso negado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-3">
            <div className="text-sm text-gray-600">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
              {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                onClick={() => fetchLogs(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50"
              >
                Próxima →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
