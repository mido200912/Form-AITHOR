import React from 'react';
import aithorLogo from '../assets/aithor-logo.png';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={aithorLogo} alt="Aithor Logo" />
      </Link>
      <div className="navbar-right">
        <button className="btn-ghost" onClick={() => navigate('/admin/login')}>
          لوحة الإدارة ↗
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
