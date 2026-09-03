import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyAddress = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyAddress);

  useEffect(() => {
    const loadCart = async () => {
      if (!user) return;
      try {
        const result = await api.getCart();
        const cartItems = result.items || [];
        setItems(cartItems);

        setForm((current) => ({
          ...current,
          fullName: user.name || current.fullName,
          email: user.email || current.email,
          phone: user.phone || current.phone,
        }));
      } catch (error) {
        console.error("Unable to load cart for checkout", error);
      } finally {
        setLoading(false);
      }
    };

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    const payload = {
      shippingAddress: {
        ...form,
        postalCode: String(form.postalCode || ""),
      },
      items: items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
      })),
      paymentMethod: "cod",
    };

    setSubmitting(true);

    try {
      const result = await api.createOrder(payload);
      if (!result || !result.order) {
        throw new Error("Order creation failed.");
      }

      navigate(`/order-success/${result.order.id}`);
    } catch (error) {
      alert(error.message || "Unable to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="eyebrow slim">Required</p>
          <h1>Please log in</h1>
          <Link to="/login" className="primary-btn">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading-box">Loading checkout...</div>;

  if (!items.length) {
    return (
      <section className="content-page">
        <div className="alert-box">
          Your cart is empty. <Link to="/books">Continue shopping</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="content-page checkout-page">
      <div className="page-header">
        <div>
          <p className="eyebrow slim">Secure order</p>
          <h1>Checkout</h1>
        </div>
      </div>

      <div className="checkout-layout">
        <form className="summary-card checkout-form" onSubmit={handleSubmit}>
          <h3>Delivery Information</h3>

          <div className="form-grid">
            <label>
              Full Name
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Country
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                required
              />
            </label>
            <label className="full-width">
              Address
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              City
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              State
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Postal Code
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="payment-box">
            <h4>Payment Method</h4>
            <p>Cash on Delivery (COD)</p>
          </div>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="summary-card order-summary-card">
          <h3>Order Summary</h3>

          {items.map((item) => (
            <div key={item.bookId} className="checkout-item-row">
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.quantity} × ₹{Number(item.price || 0)}
                </p>
              </div>
              <span>
                ₹{Number(item.price || 0) * Number(item.quantity || 0)}
              </span>
            </div>
          ))}

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
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
