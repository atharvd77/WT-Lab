import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return setLoading(false);
      try {
        const result = await api.getOrders();
        setOrders(result.orders || []);
      } catch (error) {
        console.error("Unable to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="eyebrow slim">Access required</p>
          <h1>Please log in</h1>
          <Link to="/login" className="primary-btn">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <section className="content-page account-page">
      <div className="page-header">
        <div>
          <p className="eyebrow slim">Your account</p>
          <h1>{user.name}</h1>
        </div>
      </div>

      <div className="account-grid">
        <div className="summary-card account-card">
          <h3>Profile</h3>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone || "Not provided"}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <button className="primary-btn compact-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="summary-card orders-card">
          <h3>Orders</h3>
          {loading ? (
            <div className="loading-box">Loading orders...</div>
          ) : orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="mini-order">
                <div>
                  <strong>Order #{order.id}</strong>
                  <p>{order.orderStatus}</p>
                </div>
                <span>₹{Number(order.total || 0)}</span>
              </div>
            ))
          ) : (
            <p className="empty-state">No orders yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AccountPage;
