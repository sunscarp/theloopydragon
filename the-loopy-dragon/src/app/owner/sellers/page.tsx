"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import toast from "react-hot-toast"

export default function OwnerSellersPage() {
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false })
    setSellers(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string, reason = "") => {
    const update: any = { status }
    if (reason) update.rejection_reason = reason
    const { error } = await supabase.from("sellers").update(update).eq("id", id)
    if (error) {
      toast.error("Failed to update seller status")
    } else {
      toast.success(`Seller ${status}`)
      fetchSellers()
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    rejected: "bg-gray-100 text-gray-800",
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Seller Management</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No sellers registered yet</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Shop Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sellers.map((seller: any) => (
                <tr key={seller.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer" onClick={() => router.push(`/owner/sellers/${seller.id}`)}>
                  <td className="px-4 py-3 font-medium">{seller.shop_name}</td>
                  <td className="px-4 py-3 text-gray-500">{seller.email}</td>
                  <td className="px-4 py-3 text-gray-500">/{seller.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[seller.status] || "bg-gray-100"}`}>{seller.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(seller.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    {seller.status === "pending" && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => updateStatus(seller.id, "active")} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Approve</button>
                        <button onClick={() => {
                          const reason = prompt("Rejection reason:")
                          if (reason) updateStatus(seller.id, "rejected", reason)
                        }} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Reject</button>
                      </div>
                    )}
                    {seller.status === "active" && (
                      <button onClick={() => updateStatus(seller.id, "suspended", "Suspended by admin")} className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700">Suspend</button>
                    )}
                    {seller.status === "suspended" && (
                      <button onClick={() => updateStatus(seller.id, "active")} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Reactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
