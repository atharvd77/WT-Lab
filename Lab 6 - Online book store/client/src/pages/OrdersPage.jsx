import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
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
  }, []);

  return (
    <section className="content-page orders-page">
      <div className="page-header">
        <div>
          <p className="eyebrow slim">Your purchases</p>
          <h1>My Orders</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-box">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="alert-box">
          No orders yet. <Link to="/books">Explore books</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="summary-card order-card">
              <div className="order-card-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="order-status">{order.orderStatus}</span>
              </div>

              <div className="order-items-list">
                {(order.items || []).map((item, index) => (
                  <div
                    key={`${order.id}-${item.bookId || index}`}
                    className="order-item-line"
                  >
                    <span>
                      {item.title || "Book"} × {item.quantity}
                    </span>
                    <strong>
                      ₹{Number(item.price || 0) * Number(item.quantity || 0)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="summary-row total-row">
                <span>Total</span>
                <strong>₹{Number(order.total || 0)}</strong>
              </div>

              <div className="order-meta-row">
                <span>Payment: {order.paymentMethod || "cod"}</span>
                <span>Status: {order.paymentStatus || "pending"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;
