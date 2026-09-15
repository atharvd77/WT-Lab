import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [booksByCategory, setBooksByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await api.getBooks({ limit: 200 });
        const loadedBooks = result.books || [];
        const uniqueCategories = [
          ...new Set(loadedBooks.map((book) => book.category).filter(Boolean)),
        ].sort();
        setCategories(uniqueCategories);
        const grouped = uniqueCategories.reduce((acc, category) => {
          acc[category] = loadedBooks.filter(
            (book) => book.category === category,
          );
          return acc;
        }, {});
        setBooksByCategory(grouped);
      } catch (error) {
        console.error("Unable to load categories", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) return <div className="loading-box">Loading categories...</div>;

  return (
    <section className="content-page">
      <div className="page-header">
        <div>
          <p className="eyebrow slim">Discover by interest</p>
          <h1>Categories</h1>
        </div>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <div key={category} className="category-card">
            <Link
              to={`/books?category=${encodeURIComponent(category)}`}
              className="category-link"
            >
              <span>{category}</span>
              <strong>{booksByCategory[category]?.length || 0} books</strong>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategoriesPage;
