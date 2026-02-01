import { useEffect, useState } from "react";
import API from "../../api/api";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/customer");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Fetch orders failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(() => {
    fetchOrders();
  }, 5000); // auto-refresh every 5 seconds

  return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8">📦 My Orders</h1>

      {loading ? (
        <p className="text-gray-500">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center">
          <p className="text-gray-500 text-lg">
            You haven’t placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition"
            >
              <div className="p-6 grid md:grid-cols-4 gap-6">
                {/* Product Info */}
                <div className="md:col-span-2">
                  <h2 className="text-xl font-bold mb-2">
                    {o.productName}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Ordered on{" "}
                    <b>
                      {new Date(o.createdAt).toLocaleDateString()}{" "}
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </b>
                  </p>
                </div>

                {/* Quantity & Price */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-bold text-lg">
                    {o.quantity} kg
                  </p>

                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="text-green-600 font-black text-xl">
                    ₹{o.totalPrice}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center justify-end">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                      statusColors[o.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-3 bg-gray-50 text-xs text-gray-500 flex justify-between">
                <span>Order ID: {o.id}</span>
                <span>Payment: Cash / Online</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
