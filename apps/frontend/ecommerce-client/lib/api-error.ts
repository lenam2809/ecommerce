type ApiErrorKind = "network" | "client" | "server" | "unknown"

export interface ApiErrorContext {
  endpoint?: string
  operation?: string
  method?: string
}

export interface HandleApiErrorOptions {
  error: unknown
  context?: ApiErrorContext
  notify: (args: { title: string; description?: string; id?: string }) => void
  /**
   * Title shown in development. Production always uses `prodTitle`.
   */
  devTitle?: string
  /**
   * Title shown in production.
   */
  prodTitle?: string
  /**
   * Description shown in production.
   */
  prodDescription?: string
  /**
   * When the same error happens again within this window (ms), suppress duplicates.
   */
  dedupeWindowMs?: number
  /**
   * HTTP statuses where we don't show toasts (e.g. `401` where auth flow handles it).
   */
  suppressStatuses?: number[]
}

const DEFAULT_PROD_TITLE = "Something went wrong"
const DEFAULT_PROD_DESCRIPTION = "Something went wrong, please try again later"

const dedupeCache = new Map<string, number>()

function isDev() {
  return process.env.NODE_ENV !== "production"
}

function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error"
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message

  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function getAxiosStatus(error: any): number | undefined {
  const status = error?.response?.status
  return typeof status === "number" ? status : undefined
}

function getAxiosEndpoint(error: any, fallback?: string): string | undefined {
  const url = error?.config?.url
  return typeof url === "string" ? url : fallback
}

function getAxiosMethod(error: any): string | undefined {
  const method = error?.config?.method
  return typeof method === "string" ? method.toUpperCase() : undefined
}

function getErrorKind(status: number | undefined, error: any, fallbackKind: ApiErrorKind = "unknown"): ApiErrorKind {
  if (typeof status === "number") {
    if (status >= 400 && status <= 499) return "client"
    if (status >= 500) return "server"
  }

  // Axios network errors typically have no `response`
  const hasAxiosResponse = typeof error?.response !== "undefined"
  if (!hasAxiosResponse) return "network"

  return fallbackKind
}

function buildDedupeKey(kind: ApiErrorKind, status: number | undefined, endpoint: string | undefined) {
  return `api-error:${kind}:${status ?? "na"}:${endpoint ?? "na"}`
}

function shouldSuppress(status: number | undefined, suppressStatuses: number[]) {
  if (typeof status !== "number") return false
  return suppressStatuses.includes(status)
}

function isNetworkLike(error: unknown) {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return msg.includes("failed to fetch") || msg.includes("network error") || msg.includes("timeout")
}

function getDevDescription(params: {
  kind: ApiErrorKind
  status: number | undefined
  endpoint: string | undefined
  operation: string | undefined
  method: string | undefined
  error: unknown
}) {
  const { kind, status, endpoint, operation, method, error } = params
  const base = [operation ? `operation=${operation}` : null, method ? `method=${method}` : null, endpoint ? `endpoint=${endpoint}` : null]
    .filter(Boolean)
    .join(" ")

  const statusPart = typeof status === "number" ? `status=${status}` : `status=unknown`
  const kindPart = `kind=${kind}`
  const msg = getErrorMessage(error)

  // In dev, show message + status. Avoid dumping huge payloads.
  return `${base ? `${base} ` : ""}${kindPart} ${statusPart}. ${msg}`
}

export function handleApiError(options: HandleApiErrorOptions) {
  const {
    error,
    context,
    notify,
    devTitle = "API Error",
    prodTitle = DEFAULT_PROD_TITLE,
    prodDescription = DEFAULT_PROD_DESCRIPTION,
    dedupeWindowMs = 4000,
    suppressStatuses = [401],
  } = options

  const anyErr = error as any
  const status = getAxiosStatus(anyErr)
  const kind = isNetworkLike(error) ? "network" : getErrorKind(status, anyErr, "unknown")
  const endpoint = getAxiosEndpoint(anyErr, context?.endpoint)
  const method = getAxiosMethod(anyErr) ?? context?.method
  const operation = context?.operation

  if (shouldSuppress(status, suppressStatuses)) return

  const dedupeKey = buildDedupeKey(kind, status, endpoint)
  const now = Date.now()
  const lastShownAt = dedupeCache.get(dedupeKey)
  if (lastShownAt && now - lastShownAt < dedupeWindowMs) return
  dedupeCache.set(dedupeKey, now)

  const title = isDev() ? devTitle : prodTitle
  const description = isDev()
    ? getDevDescription({ kind, status, endpoint, operation, method, error })
    : prodDescription

  notify({ title, description, id: dedupeKey })
}

