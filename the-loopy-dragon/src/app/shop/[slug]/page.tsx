"use client"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ShopPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.slug) {
      router.replace("/shop")
    }
  }, [params.slug, router])

  return null
}
