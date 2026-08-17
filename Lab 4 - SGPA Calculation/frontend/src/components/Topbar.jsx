import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">VS</span>
        VIT SGPA Calculator
      </div>
      {user && (
        <div className="topbar-actions">
          <div className="user-info">
            <div className="user-name">Atharv Dubal</div>
            <div className="user-prn">PRN: 12415024</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
