"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";

interface DashboardData {
  summary: {
    total: number;
    active: number;
    expired: number;
    suspended: number;
    expiringSoon: number;
  };
  expiringLicenses: Array<{
    id: string;
    mkAuthAddress: string;
    clientName: string;
    expiresAt: string;
    monthlyValue: number | null;
  }>;
  recentValidations: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (!data) {
    return <div className="text-center py-12">Erro ao carregar dados</div>;
  }

  const getDaysUntil = (date: string) => {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Visão geral do sistema de licenciamento</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Licenças"
          value={data.summary.total}
          icon="📊"
          color="blue"
        />
        <StatsCard
          title="Licenças Ativas"
          value={data.summary.active}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="Expirando em 7 dias"
          value={data.summary.expiringSoon}
          icon="⚠️"
          color="yellow"
        />
        <StatsCard
          title="Validações (24h)"
          value={data.recentValidations}
          icon="🔍"
          color="gray"
        />
      </div>

      {/* Expiring Licenses Alert */}
      {data.expiringLicenses.length > 0 && (
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800">
                Atenção: {data.expiringLicenses.length} licença(s) expirando nos próximos 7 dias
              </h3>
              <div className="mt-4 space-y-3">
                {data.expiringLicenses.map((license) => {
                  const daysLeft = getDaysUntil(license.expiresAt);
                  return (
                    <div
                      key={license.id}
                      className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{license.clientName}</p>
                        <p className="text-sm text-gray-500">{license.mkAuthAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-700">
                          {daysLeft} {daysLeft === 1 ? "dia" : "dias"} restante(s)
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(license.expiresAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/licenses?expiring=true"
                  className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                >
                  Ver todas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Status das Licenças</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ativas</span>
              <span className="font-semibold text-green-600">{data.summary.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expiradas</span>
              <span className="font-semibold text-red-600">{data.summary.expired}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Suspensas</span>
              <span className="font-semibold text-gray-600">{data.summary.suspended}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
          <div className="mt-4 space-y-2">
            <Link
              href="/admin/licenses/new"
              className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
            >
              + Nova Licença
            </Link>
            <Link
              href="/admin/licenses"
              className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Ver Todas as Licenças
            </Link>
            <Link
              href="/admin/validation-logs"
              className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Logs de Validação
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
