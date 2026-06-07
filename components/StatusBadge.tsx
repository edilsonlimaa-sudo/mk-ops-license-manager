"use client";

interface StatusBadgeProps {
  status: "active" | "expired" | "suspended";
  expiresAt?: Date | string | null;
}

export function StatusBadge({ status, expiresAt }: StatusBadgeProps) {
  const getStatusColor = () => {
    if (status === "active") {
      // Check if expiring soon (within 7 days)
      if (expiresAt) {
        const daysUntil = Math.ceil(
          (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntil <= 7 && daysUntil > 0) {
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
        }
      }
      return "bg-green-100 text-green-800 border-green-300";
    }
    if (status === "expired") {
      return "bg-red-100 text-red-800 border-red-300";
    }
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusLabel = () => {
    if (status === "active") return "Ativa";
    if (status === "expired") return "Expirada";
    return "Suspensa";
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor()}`}
    >
      {getStatusLabel()}
    </span>
  );
}
