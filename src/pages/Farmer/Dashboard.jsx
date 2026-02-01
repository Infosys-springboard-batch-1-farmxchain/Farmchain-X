import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Farmerlayout from "../../Layouts/Farmerlayout";
import Statcard from "../../components/Statcard";
import API from "../../api/api";
import SmartAdvisor from "./SmartAdvisor";
import { useCountUp } from "../../hooks/useCountUp";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const [farmer, setFarmer] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    activeCrops: 0,
    ordersToday: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await API.get("/users/profile");
        setFarmer(userRes.data);

        const ordersRes = await API.get("/orders/farmer");
        const productsRes = await API.get("/products/my");

        const orders = ordersRes.data || [];
        const crops = productsRes.data || [];

        const today = new Date().toDateString();

        const totalSales = orders
          .filter(
            (o) => o.status !== "REJECTED" && o.status !== "CANCELLED"
          )
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        const ordersToday = orders.filter(
          (o) => new Date(o.createdAt).toDateString() === today
        ).length;

        const activeCrops = crops.filter(
          (c) => c.status === "AVAILABLE"
        ).length;

        const lowStock = crops.filter((c) => c.quantity < 10).length;

        setStats({
          totalSales,
          activeCrops,
          ordersToday,
          lowStock,
        });
      } catch (err) {
        console.error("Dashboard sync error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location.pathname]);

  const totalSales = useCountUp(loading ? 0 : stats.totalSales);
  const activeCrops = useCountUp(loading ? 0 : stats.activeCrops);
  const ordersToday = useCountUp(loading ? 0 : stats.ordersToday);
  const lowStock = useCountUp(loading ? 0 : stats.lowStock);

  return (
    <Farmerlayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Welcome, {farmer?.name || "Farmer"} 👨‍🌾
        </h1>
        <p className="text-gray-500 text-sm">
          Farmer ID: {farmer?.id || "—"} | Account:
          <span className="ml-1 text-green-600 font-bold uppercase text-[10px]">
            Active
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Statcard title="Total Sales" value={`₹${totalSales}`} icon="💰" />
          <Statcard title="Active Crops" value={activeCrops} icon="🌾" />
          <Statcard title="Orders Today" value={ordersToday} icon="📦" />
          <Statcard title="Low Stock Alert" value={lowStock} icon="⚠️" />
        </div>

        <SmartAdvisor />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/farmer/add-crop" className="dashboard-card">
          ➕ Add New Crop
        </Link>
        <Link to="/farmer/my-crops" className="dashboard-card">
          🌾 My Warehouse
        </Link>
        <Link to="/farmer/orders" className="dashboard-card">
          📦 Manage Orders
        </Link>
      </div>
    </Farmerlayout>
  );
};

export default Dashboard;
