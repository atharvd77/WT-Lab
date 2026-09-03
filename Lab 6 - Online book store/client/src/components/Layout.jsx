import { Link, NavLink, Outlet } from "react-router-dom";
import { Search, ShoppingBag, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState } from "react";

function Layout() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/books", label: "Explore Books" },
      { to: "/categories", label: "Categories" },
      { to: "/bestsellers", label: "Bestsellers" },
      { to: "/new-arrivals", label: "New Arrivals" },
    ],
    [],
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    window.location.href = `/books?search=${encodeURIComponent(trimmed)}`;
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <Link to="/" className="brand-wrap" aria-label="BOOKVERSE home">
          <span className="brand-mark">B</span>
          <span className="brand-name">BOOKVERSE</span>
        </Link>

        <nav className="main-nav desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="profile-badge" aria-label="Student information">
            <span>Atharv Dubal</span>
            <span>RollNo : 76</span>
            <span>PRN : 12415024</span>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search books"
              aria-label="Search books"
            />
            <button
              type="submit"
              className="icon-btn"
              aria-label="Search books"
            >
              <Search size={18} />
            </button>
          </form>

          <Link to="/cart" className="icon-btn cart-icon" aria-label="Cart">
            <ShoppingBag size={18} />
          </Link>

          {user ? (
            <div className="user-menu">
              <Link to="/account" className="login-btn user-pill">
                <User size={16} /> {user.name?.split(" ")[0] || "Account"}
              </Link>
              <button className="icon-btn" onClick={logout} aria-label="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}

          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav className="mobile-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
