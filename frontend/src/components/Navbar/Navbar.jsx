import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">
        Synapse
      </NavLink>
      <div className="nav-links">
        <NavLink to="/translator">Translator</NavLink>
        <NavLink to="/conversation">Conversation Partner</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;