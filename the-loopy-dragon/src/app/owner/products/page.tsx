"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase"
import toast from "react-hot-toast"

export default function OwnerProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("pending_approval")

  useEffect(() => {
    fetchProducts()
  }, [filter])

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase.from("Inventory").select("*, sellers(shop_name, slug)").order("id", { ascending: false })
    if (filter !== "all") query = query.eq("status", filter)

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: number, status: string, reason = "") => {
    const update: any = { status }
    if (reason) update.rejection_reason = reason
    const { error } = await supabase.from("Inventory").update(update).eq("id", id)
    if (error) {
      toast.error("Failed to update product")
    } else {
      toast.success(`Product ${status}`)
      fetchProducts()
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Product Approval Queue</h1>

      <div className="mb-6">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="pending_approval">Pending Approval</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No products found</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Seller</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.ImageUrl1 && <img src={p.ImageUrl1} alt="" className="w-10 h-10 rounded object-cover" />}
                      <span className="font-medium">{p.Product}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.sellers?.shop_name || "Platform"}</td>
                  <td className="px-4 py-3">₹{p.Price}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === "active" ? "bg-green-100 text-green-800" :
                      p.status === "pending_approval" ? "bg-yellow-100 text-yellow-800" :
                      p.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "pending_approval" && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => updateStatus(p.id, "active")} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Approve</button>
                        <button onClick={() => {
                          const reason = prompt("Rejection reason:")
                          if (reason) updateStatus(p.id, "rejected", reason)
                        }} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Reject</button>
                      </div>
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
