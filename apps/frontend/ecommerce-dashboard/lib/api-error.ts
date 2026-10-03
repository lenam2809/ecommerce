type ApiErrorKind = "network" | "client" | "server" | "unknown"

export interface ApiErrorContext {
  endpoint?: string
  operation?: string
  method?: string
}

export interface ApiErrorUi {
  title: string
  description?: string
  variant: "default" | "destructive"
}

const DEFAULT_PROD_TITLE = "Something went wrong"
const DEFAULT_PROD_DESCRIPTION = "Something went wrong, please try again later"

const dedupeCache = new Map<string, number>()

interface ApiErrorLike {
  response?: {
    status?: unknown
  }
  config?: {
    url?: unknown
    method?: unknown
  }
}

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

function asApiErrorLike(error: unknown): ApiErrorLike {
  return typeof error === "object" && error !== null ? (error as ApiErrorLike) : {}
}

function getAxiosStatus(error: unknown): number | undefined {
  const status = asApiErrorLike(error).response?.status
  return typeof status === "number" ? status : undefined
}

function getAxiosEndpoint(error: unknown, fallback?: string): string | undefined {
  const url = asApiErrorLike(error).config?.url
  return typeof url === "string" ? url : fallback
}

function getAxiosMethod(error: unknown): string | undefined {
  const method = asApiErrorLike(error).config?.method
  return typeof method === "string" ? method.toUpperCase() : undefined
}

function getErrorKind(status: number | undefined, error: unknown): ApiErrorKind {
  if (typeof status === "number") {
    if (status >= 400 && status <= 499) return "client"
    if (status >= 500) return "server"
  }

  const hasAxiosResponse = typeof asApiErrorLike(error).response !== "undefined"
  if (!hasAxiosResponse) return "network"
  return "unknown"
}

function isNetworkLike(error: unknown) {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return msg.includes("failed to fetch") || msg.includes("network error") || msg.includes("timeout")
}

function buildDedupeKey(kind: ApiErrorKind, status: number | undefined, endpoint: string | undefined) {
  return `api-error:${kind}:${status ?? "na"}:${endpoint ?? "na"}`
}

function buildDevDescription(params: {
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
  return `${base ? `${base} ` : ""}${kindPart} ${statusPart}. ${msg}`
}

export function getApiErrorUi(error: unknown, context?: ApiErrorContext, ui?: { devTitle?: string }): ApiErrorUi {
  const status = getAxiosStatus(error)
  const kind = isNetworkLike(error) ? "network" : getErrorKind(status, error)
  const endpoint = getAxiosEndpoint(error, context?.endpoint)
  const method = getAxiosMethod(error) ?? context?.method
  const operation = context?.operation

  const title = isDev() ? ui?.devTitle ?? "API Error" : DEFAULT_PROD_TITLE
  const description = isDev()
    ? buildDevDescription({ kind, status, endpoint, operation, method, error })
    : DEFAULT_PROD_DESCRIPTION

  return { title, description, variant: "destructive" }
}

export function getApiErrorDescription(error: unknown, options?: { fallbackDescription?: string; context?: ApiErrorContext }) {
  if (!isDev()) return options?.fallbackDescription ?? DEFAULT_PROD_DESCRIPTION

  const status = getAxiosStatus(error)
  const kind = isNetworkLike(error) ? "network" : getErrorKind(status, error)
  const endpoint = getAxiosEndpoint(error, options?.context?.endpoint)
  const method = getAxiosMethod(error) ?? options?.context?.method
  const operation = options?.context?.operation

  return buildDevDescription({ kind, status, endpoint, operation, method, error })
}

export function handleApiError(params: {
  error: unknown
  context?: ApiErrorContext
  devTitle?: string
  suppressStatuses?: number[]
  dedupeWindowMs?: number
  notify: (ui: ApiErrorUi) => void
}) {
  const {
    error,
    context,
    devTitle = "API Error",
    suppressStatuses = [401],
    dedupeWindowMs = 4000,
    notify,
  } = params

  const status = getAxiosStatus(error)
  if (typeof status === "number" && suppressStatuses.includes(status)) return

  const kind = isNetworkLike(error) ? "network" : getErrorKind(status, error)
  const endpoint = getAxiosEndpoint(error, context?.endpoint)

  const dedupeKey = buildDedupeKey(kind, status, endpoint)
  const now = Date.now()
  const lastShownAt = dedupeCache.get(dedupeKey)
  if (lastShownAt && now - lastShownAt < dedupeWindowMs) return
  dedupeCache.set(dedupeKey, now)

  notify(getApiErrorUi(error, context, { devTitle }))
}

