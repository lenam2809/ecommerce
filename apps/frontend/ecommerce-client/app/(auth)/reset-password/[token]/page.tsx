"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LegacyResetPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/reset-password")
  }, [router])

  return null
}
