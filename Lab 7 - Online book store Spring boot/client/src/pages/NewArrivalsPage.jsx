import { useEffect, useState } from "react";
import api from "../services/api";
import BookCard from "../components/BookCard";

function NewArrivalsPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNewArrivals = async () => {
      try {
        const result = await api.getBooks({ limit: 30, sort: "newest" });
        setBooks(result.books || []);
      } catch (error) {
        console.error("Unable to load new arrivals", error);
      } finally {
        setLoading(false);
      }
    };

    loadNewArrivals();
  }, []);

  const addToCart = async (book) => {
    try {
      await api.addToCart(book.id, 1);
      alert("Book added to cart successfully.");
    } catch (err) {
      alert(err.message || "Failed to add item to cart.");
    }
  };

  return (
    <section className="content-page">
      <div className="page-header">
        <div>
          <p className="eyebrow slim">Fresh picks</p>
          <h1>New Arrivals</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-box">Loading new arrivals...</div>
      ) : (
        <div className="book-grid three-up">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </section>
  );
}

export default NewArrivalsPage;
