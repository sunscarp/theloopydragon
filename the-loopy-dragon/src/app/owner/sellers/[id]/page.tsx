"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { ArrowLeft } from "lucide-react"

export default function SellerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [seller, setSeller] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    const fetchData = async () => {
      const { data: sellerData } = await supabase.from("sellers").select("*").eq("id", params.id).single()
      setSeller(sellerData)

      const { data: productData } = await supabase.from("Inventory").select("*").eq("seller_id", params.id).order("id", { ascending: false })
      setProducts(productData || [])

      const { data: orderData } = await supabase.from("Orders").select("*").eq("seller_id", params.id).order("Order Date", { ascending: false }).limit(20)
      setOrders(orderData || [])

      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>
  if (!seller) return <div className="text-center py-8 text-gray-500">Seller not found</div>

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o["Total Price"]) || 0), 0)

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Sellers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              {seller.logo_url && <img src={seller.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover" />}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{seller.shop_name}</h1>
                <p className="text-gray-500">/{seller.slug}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-gray-500">Products</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-gray-500">Orders</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Products</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">No products yet</p>
            ) : (
              <div className="space-y-2">
                {products.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      {p.ImageUrl1 && <img src={p.ImageUrl1} alt="" className="w-8 h-8 rounded object-cover" />}
                      <span className="text-sm">{p.Product}</span>
                    </div>
                    <span className="text-sm text-gray-500">₹{p.Price} · {p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Email:</span> <span className="float-right">{seller.email}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="float-right">{seller.phone || "—"}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className="float-right">{seller.status}</span></div>
              <div><span className="text-gray-500">GSTIN:</span> <span className="float-right">{seller.gstin || "—"}</span></div>
              <div><span className="text-gray-500">PAN:</span> <span className="float-right">{seller.pan || "—"}</span></div>
            </div>
          </div>

          {seller.pickup_address && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pickup Address</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{seller.pickup_address.address}</p>
              <p className="text-sm text-gray-500">{seller.pickup_address.city}, {seller.pickup_address.state} — {seller.pickup_address.pincode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
