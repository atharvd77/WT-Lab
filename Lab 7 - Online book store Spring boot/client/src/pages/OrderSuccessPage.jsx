import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const result = await api.getOrder(orderId);
        setOrder(result.order || null);
      } catch (error) {
        console.error("Unable to load order details", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading)
    return <div className="loading-box">Loading confirmation...</div>;

  return (
    <section className="content-page order-success-page">
      <div className="auth-card success-card">
        <p className="eyebrow slim">Order placed</p>
        <h1>Thank you for your order!</h1>

        {order ? (
          <>
            <p>
              Your order <strong>#{order.id}</strong> has been placed
              successfully.
            </p>
            <p>Payment method: Cash on Delivery</p>
            <p>
              Total: <strong>₹{Number(order.total || 0)}</strong>
            </p>
          </>
        ) : (
          <p>Your order has been placed successfully.</p>
        )}

        <div className="success-actions">
          <Link to="/orders" className="primary-btn">
            My Orders
          </Link>
          <Link to="/books" className="secondary-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccessPage;
