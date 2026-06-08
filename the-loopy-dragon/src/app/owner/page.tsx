"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { storage } from "@/utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface ProductFormData {
  Product: string;
  Quantity: number;
  Price: number;
  ImageUrl1: string;
  Weight: number;
  Length: number;
  Width: number;
  Height: number;
  Tag: string;
  ImageUrl2: string;
  ImageUrl3: string;
  ImageUrl4: string;
  ImageUrl5: string;
  Description: string;
  Material: string;
}

export default function OwnerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

//fhofah
  
  const [uploadingImages, setUploadingImages] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false,
    image5: false,
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<ProductFormData>({
    Product: "",
    Quantity: 0,
    Price: 0,
    ImageUrl1: "",
    Weight: 0,
    Length: 0,
    Width: 0,
    Height: 0,
    Tag: "",
    ImageUrl2: "",
    ImageUrl3: "",
    ImageUrl4: "",
    ImageUrl5: "",
    Description: "",
    Material: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user as { email?: string } | null;

      const authorizedEmails = [
        "sanskarisamazing@gmail.com",
        "snp480@gmail.com",
        "ssp3201@gmail.com",
        "f20231193@hyderabad.bits-pilani.ac.in"
      ];

      if (!currentUser || !currentUser.email || !authorizedEmails.includes(currentUser.email)) {
        router.push("/");
        return;
      }

      setUser(currentUser);
      fetchOrders();
    };

    checkAuth();
  }, [router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all from "Your Profile"
      const { data: profileData, error: profileError } = await supabase
        .from("Your Profile")
        .select(`
          order_id,
          Status,
          "Order Date",
          Products,
          uid
        `)
        .order("Order Date", { ascending: false });

      if (profileError) {
        setError("Error fetching orders: " + profileError.message);
        setLoading(false);
        return;
      }

      // Fetch all from "Orders"
      const { data: ordersData, error: ordersError } = await supabase
        .from("Orders")
        .select(`
          order_id,
          "Total Price",
          Address,
          Pincode,
          "Order Date",
          "Shipping Cost",
          uid
        `);

      if (ordersError) {
        setError("Error fetching order details: " + ordersError.message);
        setLoading(false);
        return;
      }

      // Merge by order_id
      const ordersMap = new Map();
      if (ordersData) {
        for (const o of ordersData) {
          ordersMap.set(o.order_id, o);
        }
      }

      const merged = (profileData || []).map((profileOrder) => ({
        ...profileOrder,
        Orders: ordersMap.get(profileOrder.order_id) || {}
      }));

      setOrders(merged);
    } catch (err) {
      setError("Unexpected error occurred");
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("Your Profile")
      .update({ Status: newStatus })
      .eq("order_id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      return;
    }

    fetchOrders();
  };

  const handleImageUpload = async (
    file: File,
    imageField: "ImageUrl1" | "ImageUrl2" | "ImageUrl3" | "ImageUrl4" | "ImageUrl5",
    uploadKey: "image1" | "image2" | "image3" | "image4" | "image5"
  ): Promise<void> => {
    try {
      setUploadingImages((prev) => ({ ...prev, [uploadKey]: true }));
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `product-images/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setFormData((prev) => ({ ...prev, [imageField]: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please check Firebase Storage permissions and try again.");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageField: "ImageUrl1" | "ImageUrl2" | "ImageUrl3" | "ImageUrl4" | "ImageUrl5",
    uploadKey: "image1" | "image2" | "image3" | "image4" | "image5"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file, imageField, uploadKey);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["Quantity", "Price", "Weight", "Length", "Width", "Height"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Product || !formData.ImageUrl1) {
      alert("Product name and main image are required!");
      return;
    }

    setSubmittingProduct(true);

    try {
      const response = await fetch("/api/add-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Product added successfully!");
        // Reset form
        setFormData({
          Product: "",
          Quantity: 0,
          Price: 0,
          ImageUrl1: "",
          Weight: 0,
          Length: 0,
          Width: 0,
          Height: 0,
          Tag: "",
          ImageUrl2: "",
          ImageUrl3: "",
          ImageUrl4: "",
          ImageUrl5: "",
          Description: "",
          Material: "",
        });
      } else {
        alert("Failed to add product: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Owner Dashboard</h1>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">Error</h2>
            <pre className="whitespace-pre-wrap text-red-600 dark:text-red-300 text-sm">
              {error}
            </pre>
            <button
              onClick={() => {
                setError(null);
                fetchOrders();
              }}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Owner Dashboard
          </h1>

          {/* Add Product */}
          
            <form onSubmit={handleSubmitProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="Product"
                    value={formData.Product}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Asymmetrical Beaded Earrings"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="Quantity"
                    value={formData.Quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="999"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="Price"
                    value={formData.Price}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="100"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    name="Weight"
                    value={formData.Weight}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="120"
                  />
                </div>

                {/* Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    name="Length"
                    value={formData.Length}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.5"
                  />
                </div>

                {/* Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    name="Width"
                    value={formData.Width}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.5"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="Height"
                    value={formData.Height}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="6"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    name="Material"
                    value={formData.Material}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Beads, Chains"
                  />
                </div>
              </div>

              {/* Image Uploads */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Product Images
                </h3>
                
                {/* Image 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image 1 * (Main Image)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, "ImageUrl1", "image1")}
                      className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                    {uploadingImages.image1 && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    )}
                  </div>
                  {formData.ImageUrl1 && (
                    <div className="mt-4">
                      <img
                        src={formData.ImageUrl1}
                        alt="Preview 1"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Image 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image 2
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, "ImageUrl2", "image2")}
                      className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                    {uploadingImages.image2 && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    )}
                  </div>
                  {formData.ImageUrl2 && (
                    <div className="mt-4">
                      <img
                        src={formData.ImageUrl2}
                        alt="Preview 2"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Image 3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image 3
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, "ImageUrl3", "image3")}
                      className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                    {uploadingImages.image3 && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    )}
                  </div>
                  {formData.ImageUrl3 && (
                    <div className="mt-4">
                      <img
                        src={formData.ImageUrl3}
                        alt="Preview 3"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Image 4 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image 4
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, "ImageUrl4", "image4")}
                      className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                    {uploadingImages.image4 && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    )}
                  </div>
                  {formData.ImageUrl4 && (
                    <div className="mt-4">
                      <img
                        src={formData.ImageUrl4}
                        alt="Preview 4"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Image 5 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image 5
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, "ImageUrl5", "image5")}
                      className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                    {uploadingImages.image5 && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    )}
                  </div>
                  {formData.ImageUrl5 && (
                    <div className="mt-4">
                      <img
                        src={formData.ImageUrl5}
                        alt="Preview 5"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="Tag"
                  value={formData.Tag}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Earrings, Jewellery, Beaded Earrings, Yellow, Orange, Red"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="These asymmetrical earrings feature a minimal design..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingProduct || Object.values(uploadingImages).some(v => v)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingProduct ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding Product...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
        </div>

        {/* Management Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/owner/sellers" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seller Management</h2>
            <p className="text-gray-500 dark:text-gray-400">Approve, suspend, or review sellers</p>
          </Link>
          <Link href="/owner/products" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Product Approval</h2>
            <p className="text-gray-500 dark:text-gray-400">Review and approve seller products</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
