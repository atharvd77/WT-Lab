import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [dashboardData, orderData, inventoryData] = await Promise.all([
          api.getAdminDashboard(),
          api.getAdminOrders(),
          api.getAdminInventory(),
        ]);
        setDashboard(dashboardData);
        setOrders(orderData.orders || []);
        setInventory(inventoryData.books || []);
      } catch (error) {
        console.error("Unable to load admin data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;
  if (loading)
    return <div className="loading-box">Loading admin dashboard...</div>;

  return (
    <section className="content-page admin-page">
      <div className="page-header">
        <div>
          <p className="eyebrow slim">Management</p>
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      <div className="admin-stats">
        <div className="summary-card stat-card">
          <span>Total Revenue</span>
          <strong>₹{Number(dashboard?.stats?.totalRevenue || 0)}</strong>
        </div>
        <div className="summary-card stat-card">
          <span>Orders</span>
          <strong>{dashboard?.stats?.orders || 0}</strong>
        </div>
        <div className="summary-card stat-card">
          <span>Customers</span>
          <strong>{dashboard?.stats?.customers || 0}</strong>
        </div>
        <div className="summary-card stat-card">
          <span>Books</span>
          <strong>{dashboard?.stats?.books || 0}</strong>
        </div>
      </div>

      <div className="admin-sections">
        <div className="summary-card">
          <h3>Recent Orders</h3>
          {orders.length ? (
            orders.slice(0, 5).map((order) => (
              <div key={order.id} className="mini-order">
                <div>
                  <strong>Order #{order.id}</strong>
                  <p>{order.orderStatus}</p>
                </div>
                <span>₹{Number(order.total || 0)}</span>
              </div>
            ))
          ) : (
            <p className="empty-state">No orders found.</p>
          )}
        </div>

        <div className="summary-card">
          <h3>Inventory</h3>
          {inventory.length ? (
            inventory.map((book) => (
              <div key={book.id} className="inventory-row">
                <span>{book.title}</span>
                <strong>{book.stock} left</strong>
              </div>
            ))
          ) : (
            <p className="empty-state">No inventory items found.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminPage;
