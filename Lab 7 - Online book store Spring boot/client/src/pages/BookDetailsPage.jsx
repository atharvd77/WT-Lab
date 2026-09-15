import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, ShoppingCart, Minus, Plus } from "lucide-react";
import api from "../services/api";

function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewStatus, setReviewStatus] = useState("");

  const loadBook = async () => {
    setLoading(true);
    try {
      const result = await api.getBook(id);
      setBook(result.book);
      const reviewResponse = await api.getReviews(id);
      setReviews(reviewResponse.reviews || []);
    } catch (err) {
      setError(err.message || "Unable to load book details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  const addToCart = async () => {
    try {
      await api.addToCart(Number(id), quantity);
      alert("Book added to cart successfully.");
    } catch (err) {
      alert(err.message || "Failed to add item to cart.");
    }
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) {
      setReviewStatus("Please add a review comment.");
      return;
    }

    try {
      await api.submitReview(id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: 5, comment: "" });
      setReviewStatus("Review submitted successfully.");
      await loadBook();
    } catch (err) {
      setReviewStatus(err.message || "Unable to submit review.");
    }
  };

  if (loading)
    return <div className="loading-box">Loading book details...</div>;
  if (error) return <div className="alert-box error-box">{error}</div>;
  if (!book) return <div className="alert-box">Book not found.</div>;

  return (
    <section className="book-detail-page">
      <div className="detail-layout">
        <div className="detail-cover-wrap">
          <img
            src={
              book.coverImage ||
              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
            }
            alt={book.title}
          />
        </div>

        <div className="detail-info">
          <span className="book-tag">{book.category}</span>
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>
          <div className="detail-rating">
            <Star size={16} fill="currentColor" />{" "}
            {Number(book.rating || 0).toFixed(1)} ·{" "}
            {book.numReviews || reviews.length || 0} reviews
          </div>
          <div className="detail-price-row">
            <strong>₹{Number(book.price || 0)}</strong>
            {Number(book.originalPrice || 0) > Number(book.price || 0) && (
              <span>₹{Number(book.originalPrice || 0)}</span>
            )}
          </div>
          <p className="detail-description">{book.description}</p>

          <div className="stock-row">
            <span
              className={
                Number(book.stock || 0) > 0 ? "stock-available" : "stock-out"
              }
            >
              {Number(book.stock || 0) > 0
                ? `${book.stock} in stock`
                : "Out of stock"}
            </span>
          </div>

          <div className="quantity-row">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)}>
              <Plus size={16} />
            </button>
          </div>

          <div className="detail-actions">
            <button className="primary-btn compact-btn" onClick={addToCart}>
              <ShoppingCart size={16} /> Add to Cart
            </button>
          </div>

          <div className="meta-list">
            <div>
              <span>Category</span>
              <strong>{book.category}</strong>
            </div>
            <div>
              <span>Publisher</span>
              <strong>{book.publisher || "Unknown"}</strong>
            </div>
            <div>
              <span>Language</span>
              <strong>{book.language || "English"}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        <div className="review-form">
          <select
            value={reviewForm.rating}
            onChange={(event) =>
              setReviewForm({ ...reviewForm, rating: event.target.value })
            }
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <textarea
            value={reviewForm.comment}
            onChange={(event) =>
              setReviewForm({ ...reviewForm, comment: event.target.value })
            }
            placeholder="Write your review..."
          />
          <button className="primary-btn compact-btn" onClick={submitReview}>
            Submit Review
          </button>
          {reviewStatus && <p className="review-status">{reviewStatus}</p>}
        </div>

        <div className="review-list">
          {reviews.length ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <strong>{review.User?.name || "Verified Reader"}</strong>
                  <span>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="empty-state">
              No reviews yet. Be the first to add one.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default BookDetailsPage;
