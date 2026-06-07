"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewLicensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data: any = {
      mkAuthAddress: formData.get("mkAuthAddress"),
      clientName: formData.get("clientName"),
      cnpj: formData.get("cnpj") || undefined,
      billingEmail: formData.get("billingEmail") || undefined,
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
      monthlyValue: formData.get("monthlyValue")
        ? parseFloat(formData.get("monthlyValue") as string)
        : undefined,
      billingDay: formData.get("billingDay")
        ? parseInt(formData.get("billingDay") as string)
        : undefined,
      notes: formData.get("notes") || undefined,
    };

    const res = await fetch("/api/admin/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/licenses");
    } else {
      const err = await res.json();
      setError(err.error || "Erro ao criar licença");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/licenses" className="text-sm text-blue-600 hover:text-blue-800">
          ← Voltar para licenças
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Nova Licença</h1>
        <p className="mt-2 text-gray-600">
          Crie uma nova licença para uma empresa. A validade padrão é de 30 dias.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Endereço mk-auth <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mkAuthAddress"
              required
              placeholder="192.168.1.10 ou empresa.mkauth.com"
              className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              IP ou domínio do servidor mk-auth (identificador único da empresa)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome da Empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientName"
              required
              placeholder="Empresa Exemplo Ltda"
              className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
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
                placeholder="00.000.000/0000-00"
                className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="text"
                name="phone"
                placeholder="(00) 00000-0000"
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
              placeholder="financeiro@empresa.com"
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
              placeholder="Rua, número, bairro, cidade - UF, CEP"
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
                placeholder="150.00"
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
                placeholder="10"
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
            placeholder="Informações adicionais sobre esta licença..."
            className="mt-1 block w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 border-t pt-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Licença"}
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
