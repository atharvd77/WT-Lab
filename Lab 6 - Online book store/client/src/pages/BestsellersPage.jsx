import { useEffect, useState } from "react";
import api from "../services/api";
import BookCard from "../components/BookCard";

function BestsellersPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        const result = await api.getBooks({ limit: 50, sort: "rating" });
        const bestsellers = (result.books || [])
          .filter((book) => book.bestseller || Number(book.rating) >= 4.6)
          .slice(0, 12);
        setBooks(bestsellers);
      } catch (error) {
        console.error("Unable to load bestsellers", error);
      } finally {
        setLoading(false);
      }
    };

    loadBestsellers();
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
          <p className="eyebrow slim">Top picks</p>
          <h1>Bestsellers</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-box">Loading bestsellers...</div>
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

export default BestsellersPage;
