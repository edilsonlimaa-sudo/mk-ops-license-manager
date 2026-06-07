/** Status possíveis de uma licença */
export type LicenseStatus = "active" | "expired" | "suspended" | "not_found";

/** Request enviado ao servidor de licenças */
export interface LicenseValidationRequest {
  mkAuthAddress: string;
}

/** Response do servidor de licenças */
export interface LicenseValidationResponse {
  /** Acesso permitido? true = active || (expired && dentro da graça) */
  valid: boolean;
  /** Status real da licença */
  status: LicenseStatus;
  /** Razão quando inválida */
  reason?: "expired" | "suspended" | "not_found";
  /** Nome do cliente (empresa) */
  clientName?: string;
  /** Data de expiração da licença (ISO 8601 UTC) */
  expiresAt?: string;
  /** Data de fim do período de graça = expiresAt + 7 dias (ISO 8601 UTC) */
  gracePeriodEndsAt?: string;
}
