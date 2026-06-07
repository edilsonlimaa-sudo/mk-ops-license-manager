"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";

interface License {
  id: string;
  mkAuthAddress: string;
  clientName: string;
  status: "active" | "expired" | "suspended";
  expiresAt: string | null;
  monthlyValue: number | null;
  cnpj: string | null;
  billingEmail: string | null;
  phone: string | null;
}

export default function LicensesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  useEffect(() => {
    fetchLicenses();
  }, [searchParams]);

  const fetchLicenses = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    if (searchParams.get("expiring")) params.set("expiring", "true");

    const res = await fetch(`/api/admin/licenses?${params}`);
    const data = await res.json();
    setLicenses(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    router.push(`/admin/licenses?${params}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta licença?")) return;

    await fetch(`/api/admin/licenses/${id}`, { method: "DELETE" });
    fetchLicenses();
  };

  const handleRenew = async (id: string) => {
    await fetch(`/api/admin/licenses/${id}/renew`, { method: "POST" });
    fetchLicenses();
  };

  const handleSuspend = async (id: string) => {
    await fetch(`/api/admin/licenses/${id}/suspend`, { method: "POST" });
    fetchLicenses();
  };

  const handleActivate = async (id: string) => {
    await fetch(`/api/admin/licenses/${id}/activate`, { method: "POST" });
    fetchLicenses();
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Licenças</h1>
          <p className="mt-2 text-gray-600">Gerencie todas as licenças do sistema</p>
        </div>
        <Link
          href="/admin/licenses/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          + Nova Licença
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-white p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nome, endereço ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="expired">Expiradas</option>
            <option value="suspended">Suspensas</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-6 py-2 font-medium text-white hover:bg-gray-800"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : licenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nenhuma licença encontrada</div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Endereço mk-auth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Expira em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Valor Mensal
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {licenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{license.clientName}</div>
                      {license.cnpj && (
                        <div className="text-sm text-gray-500">CNPJ: {license.cnpj}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{license.mkAuthAddress}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={license.status} expiresAt={license.expiresAt} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(license.expiresAt)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(license.monthlyValue)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/licenses/${license.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleRenew(license.id)}
                        className="text-sm font-medium text-green-600 hover:text-green-800"
                      >
                        Renovar
                      </button>
                      {license.status === "suspended" ? (
                        <button
                          onClick={() => handleActivate(license.id)}
                          className="text-sm font-medium text-green-600 hover:text-green-800"
                        >
                          Ativar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(license.id)}
                          className="text-sm font-medium text-yellow-600 hover:text-yellow-800"
                        >
                          Suspender
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(license.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
