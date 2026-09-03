import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import api from "../services/api";
import BookCard from "../components/BookCard";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("relevance");
  const [categories, setCategories] = useState([]);

  const loadBooks = async (
    nextSearch = search,
    nextCategory = category,
    nextSort = sort,
  ) => {
    setLoading(true);
    setError("");

    try {
      const result = await api.getBooks({
        search: nextSearch,
        category: nextCategory,
        sort: nextSort,
        limit: 18,
      });
      setBooks(result.books || []);
    } catch (err) {
      setError(err.message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await api.getBooks({ limit: 200 });
        const nextCategories = [
          ...new Set(
            (result.books || []).map((book) => book.category).filter(Boolean),
          ),
        ].sort();
        setCategories(nextCategories);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
    loadBooks();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadBooks(search, category, sort);
  };

  const filteredSummary = useMemo(() => {
    const total = books.length;
    return total
      ? `${total} book${total > 1 ? "s" : ""} found`
      : "No books found";
  }, [books]);

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
          <p className="eyebrow slim">Curated collection</p>
          <h1>Explore Books</h1>
        </div>
      </div>

      <div className="filter-panel">
        <form className="search-form page-search" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or author"
          />
          <button type="submit" className="primary-btn compact-btn">
            <Search size={16} /> Search
          </button>
        </form>

        <div className="filter-row">
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              loadBooks(search, event.target.value, sort);
            }}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              loadBooks(search, category, event.target.value);
            }}
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="results-bar">
        <span>{filteredSummary}</span>
      </div>

      {loading ? (
        <div className="loading-box">Loading books...</div>
      ) : error ? (
        <div className="alert-box error-box">{error}</div>
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

export default BooksPage;
