"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { use } from "react";

interface License {
  id: string;
  mkAuthAddress: string;
  clientName: string;
  status: "active" | "expired" | "suspended";
  cnpj: string | null;
  billingEmail: string | null;
  phone: string | null;
  address: string | null;
  monthlyValue: string | null;
  billingDay: number | null;
  notes: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function EditLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/licenses/${id}`)
      .then((res) => res.json())
      .then(setLicense)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data: any = {
      clientName: formData.get("clientName"),
      cnpj: formData.get("cnpj") || undefined,
      billingEmail: formData.get("billingEmail") || "",
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
      monthlyValue: formData.get("monthlyValue")
        ? parseFloat(formData.get("monthlyValue") as string)
        : null,
      billingDay: formData.get("billingDay")
        ? parseInt(formData.get("billingDay") as string)
        : null,
      notes: formData.get("notes") || undefined,
      status: formData.get("status"),
      expiresAt: formData.get("expiresAt")
        ? new Date(formData.get("expiresAt") as string).toISOString()
        : undefined,
    };

    const res = await fetch(`/api/admin/licenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/licenses");
    } else {
      const err = await res.json();
      setError(err.error || "Erro ao atualizar licença");
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Carregando...</div>;
  if (!license) return <div className="text-center py-12">Licença não encontrada</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/licenses" className="text-sm text-blue-600 hover:text-blue-800">
          ← Voltar para licenças
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{license.clientName}</h1>
            <p className="mt-2 text-gray-600">{license.mkAuthAddress}</p>
          </div>
          <StatusBadge status={license.status} expiresAt={license.expiresAt} />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <form key={license.id} onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Endereço mk-auth
            </label>
            <input
              type="text"
              value={license.mkAuthAddress}
              disabled
              className="mt-1 block w-full rounded-lg border bg-gray-50 px-4 py-2 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              O endereço mk-auth não pode ser alterado
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientName"
              required
              defaultValue={license.clientName}
              className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Nome da empresa que utiliza a licença
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                defaultValue={license.status}
                className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="active">Ativa</option>
                <option value="expired">Expirada</option>
                <option value="suspended">Suspensa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data de Expiração
              </label>
              <input
                type="date"
                name="expiresAt"
                defaultValue={
                  license.expiresAt
                    ? new Date(license.expiresAt).toISOString().split("T")[0]
                    : ""
                }
                className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Dados de Cobrança</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CNPJ</label>
              <input
                type="text"
                name="cnpj"
                defaultValue={license.cnpj || ""}
                className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="text"
                name="phone"
                defaultValue={license.phone || ""}
                className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email de Cobrança
            </label>
            <input
              type="email"
              name="billingEmail"
              defaultValue={license.billingEmail || ""}
              className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Endereço Completo
            </label>
            <input
              type="text"
              name="address"
              defaultValue={license.address || ""}
              className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valor Mensal (R$)
              </label>
              <input
                type="number"
                name="monthlyValue"
                step="0.01"
                min="0"
                defaultValue={license.monthlyValue || ""}
                className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dia de Vencimento
              </label>
              <input
                type="number"
                name="billingDay"
                min="1"
                max="31"
                defaultValue={license.billingDay || ""}
                className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">Dia do mês (1-31)</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700">
            Observações / Notas
          </label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={license.notes || ""}
            className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 border-t pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          <Link
            href="/admin/licenses"
            className="rounded-lg border px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
