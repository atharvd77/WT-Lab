import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";

function BookCard({ book, onAddToCart }) {
  const price = Number(book.price || 0);
  const originalPrice = Number(book.originalPrice || price);

  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`} className="cover-wrap">
        <img
          src={
            book.coverImage ||
            book.cover ||
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
          }
          alt={book.title}
        />
      </Link>

      <div className="book-meta">
        <span className="book-author">{book.author}</span>
        <Link to={`/books/${book.id}`} className="book-title-link">
          <h3>{book.title}</h3>
        </Link>
        <div className="rating-line">
          <Star size={14} fill="currentColor" />{" "}
          {Number(book.rating || 0).toFixed(1)}
        </div>
        <div className="price-row">
          <strong>₹{price}</strong>
          {originalPrice > price && <span>₹{originalPrice}</span>}
        </div>
        <div className="book-card-actions">
          <button
            className="primary-btn compact-btn"
            onClick={() => onAddToCart?.(book)}
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
          <Link
            to={`/books/${book.id}`}
            className="secondary-btn compact-btn inline-link"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BookCard;
