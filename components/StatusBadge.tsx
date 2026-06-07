"use client";

interface StatusBadgeProps {
  status: "active" | "expired" | "suspended";
  expiresAt?: Date | string | null;
}

type ScenarioType = 
  | "active_ok"      // Verde - Ativa e longe de expirar
  | "active_warning" // Amarelo - Ativa mas expirando em breve
  | "grace_period"   // Laranja - Expirada mas em período de graça (ainda válida)
  | "expired"        // Vermelho - Expirada e bloqueada
  | "suspended";     // Cinza - Suspensa

export function StatusBadge({ status, expiresAt }: StatusBadgeProps) {
  const getScenario = (): {
    type: ScenarioType;
    label: string;
    description: string;
    color: string;
    icon: string;
    daysInfo?: string;
  } => {
    const now = new Date();
    const expiry = expiresAt ? new Date(expiresAt) : null;
    const gracePeriodEnd = expiry ? new Date(expiry.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

    if (status === "suspended") {
      return {
        type: "suspended",
        label: "Suspensa",
        description: "Acesso bloqueado manualmente",
        color: "bg-gray-100 text-gray-800 border-gray-400",
        icon: "⏸",
      };
    }

    if (status === "expired") {
      // Expirada - verificar se está em grace period
      if (gracePeriodEnd && now < gracePeriodEnd) {
        const daysLeft = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          type: "grace_period",
          label: "Período de Graça",
          description: "Expirada mas ainda com acesso",
          color: "bg-orange-100 text-orange-800 border-orange-400",
          icon: "⚠️",
          daysInfo: `${daysLeft}d restantes`,
        };
      }
      // Expirada e fora do grace period
      const daysAgo = expiry ? Math.abs(Math.floor((now.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      return {
        type: "expired",
        label: "Expirada",
        description: "Acesso bloqueado",
        color: "bg-red-100 text-red-800 border-red-400",
        icon: "❌",
        daysInfo: `há ${daysAgo}d`,
      };
    }

    // Status active
    if (expiry) {
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 7 && daysUntil > 0) {
        return {
          type: "active_warning",
          label: "Expirando em Breve",
          description: "Renovação necessária",
          color: "bg-yellow-100 text-yellow-800 border-yellow-400",
          icon: "⏰",
          daysInfo: `${daysUntil}d restantes`,
        };
      }
      
      return {
        type: "active_ok",
        label: "Ativa",
        description: "Funcionando normalmente",
        color: "bg-green-100 text-green-800 border-green-400",
        icon: "✓",
        daysInfo: `${daysUntil}d restantes`,
      };
    }

    return {
      type: "active_ok",
      label: "Ativa",
      description: "Funcionando normalmente",
      color: "bg-green-100 text-green-800 border-green-400",
      icon: "✓",
    };
  };

  const scenario = getScenario();

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-semibold ${scenario.color}`}
      >
        <span className="text-base">{scenario.icon}</span>
        <span>{scenario.label}</span>
      </span>
      <span className="text-xs text-gray-500 italic">{scenario.description}</span>
    </div>
  );
}
