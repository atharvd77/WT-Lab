import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Search,
  ShoppingBag,
  Star,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";
import BookCard from "../components/BookCard";

function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedBooks = async () => {
      try {
        const result = await api.getBooks({ limit: 6, sort: "rating" });
        setBooks(result.books || []);
      } catch (error) {
        console.error("Failed to load featured books", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedBooks();
  }, []);

  const featuredBooks = books
    .filter((book) => book.featured || book.bestseller)
    .slice(0, 3);

  const addToCart = async (book) => {
    try {
      await api.addToCart(book.id, 1);
      alert("Book added to cart successfully.");
    } catch (error) {
      alert(error.message || "Failed to add item to cart.");
    }
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles size={16} /> Handpicked stories for curious minds
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Discover Your Next Great Read.
          </motion.h1>
          <motion.p
            className="subtext"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Stories, ideas and worlds waiting to be discovered.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link to="/books" className="primary-btn">
              Explore Books <ArrowRight size={18} />
            </Link>
            <Link to="/bestsellers" className="secondary-btn">
              Browse Bestsellers
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <div className="book-stack">
            {(featuredBooks.length ? featuredBooks : books.slice(0, 3)).map(
              (book, index) => (
                <div
                  key={book.id || index}
                  className="floating-book"
                  style={{
                    transform: `translate(${index * 28}px, ${index * 14}px) rotate(${index * 8 - 8}deg)`,
                  }}
                >
                  <img
                    src={
                      book.coverImage ||
                      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={book.title}
                  />
                </div>
              ),
            )}
          </div>
          <div className="hero-card">
            <div className="mini-stat">
              <BookOpen size={18} />
              <span>12k+ readers</span>
            </div>
            <div className="mini-rating">
              <Star size={14} fill="currentColor" /> 4.9 average
            </div>
          </div>
        </motion.div>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <p>Handpicked for curious minds</p>
          <h2>Featured Books</h2>
        </div>

        {loading ? (
          <div className="loading-box">Loading books...</div>
        ) : (
          <div className="book-grid three-up">
            {books.slice(0, 6).map((book, index) => (
              <motion.article
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
              >
                <BookCard book={book} onAddToCart={addToCart} />
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default HomePage;
