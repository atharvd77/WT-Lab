import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!user) return;
    try {
      const result = await api.getCart();
      setItems(result.items || []);
    } catch (error) {
      console.error("Unable to load cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadCart();
  }, [user]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [items],
  );
  const shippingFee = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shippingFee;

  const updateQuantity = async (bookId, quantity) => {
    if (quantity <= 0) {
      await api.removeCartItem(bookId);
      await loadCart();
      return;
    }

    try {
      await api.updateCartItem(bookId, quantity);
      await loadCart();
    } catch (err) {
      alert(err.message || "Failed to update cart.");
    }
  };

  const removeItem = async (bookId) => {
    try {
      await api.removeCartItem(bookId);
      await loadCart();
    } catch (err) {
      alert(err.message || "Failed to remove item.");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    navigate("/checkout");
  };

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="eyebrow slim">Required</p>
          <h1>Login to continue</h1>
          <Link to="/login" className="primary-btn">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading-box">Loading cart...</div>;

  return (
    <section className="content-page cart-page">
      <div className="page-header">
        <div>
          <p className="eyebrow slim">Your selections</p>
          <h1>Cart</h1>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="alert-box">
          Your cart is empty. <Link to="/books">Continue shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <div key={item.bookId} className="cart-item">
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={item.title}
                />
                <div className="cart-item-body">
                  <h3>{item.title}</h3>
                  <p>₹{Number(item.price || 0)} each</p>
                  <div className="quantity-row small-qty">
                    <button
                      onClick={() =>
                        updateQuantity(item.bookId, Number(item.quantity) - 1)
                      }
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.bookId, Number(item.quantity) + 1)
                      }
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <strong>
                    ₹{Number(item.price || 0) * Number(item.quantity || 0)}
                  </strong>
                  <button
                    className="icon-btn danger"
                    onClick={() => removeItem(item.bookId)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>₹{shippingFee}</strong>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>
            <button className="primary-btn" onClick={handleCheckout}>
              Checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default CartPage;
