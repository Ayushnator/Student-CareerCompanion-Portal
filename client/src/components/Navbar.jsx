import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `px-3 py-2 rounded block ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, signout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-gray-800 text-xl" onClick={closeMenu}>
            Student Nexus
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            <NavItem to="/">Dashboard</NavItem>
            <NavItem to="/academic">Academic Hub</NavItem>
            <NavItem to="/ai-mentor">AI Mentor</NavItem>
            <NavItem to="/interview">Interview</NavItem>
            <NavItem to="/resume">Resume</NavItem>
            <NavItem to="/jobs">Jobs</NavItem>
            <NavItem to="/dsa">DSA Visualizer</NavItem>
            {user && user.role === 'admin' && (
              <NavItem to="/admin">Admin</NavItem>
            )}

            {!loading && !user && (
              <NavItem to="/login">Login</NavItem>
            )}

            {!loading && user && (
              <button
                className="px-3 py-2 rounded text-red-700 hover:bg-red-50"
                onClick={signout}
                type="button"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            <NavItem to="/" onClick={closeMenu}>Dashboard</NavItem>
            <NavItem to="/academic" onClick={closeMenu}>Academic Hub</NavItem>
            <NavItem to="/ai-mentor" onClick={closeMenu}>AI Mentor</NavItem>
            <NavItem to="/interview" onClick={closeMenu}>Interview</NavItem>
            <NavItem to="/resume" onClick={closeMenu}>Resume</NavItem>
            <NavItem to="/jobs" onClick={closeMenu}>Jobs</NavItem>
            <NavItem to="/dsa" onClick={closeMenu}>DSA Visualizer</NavItem>
            {user && user.role === 'admin' && (
              <NavItem to="/admin" onClick={closeMenu}>Admin</NavItem>
            )}

            {!loading && !user && (
              <NavItem to="/login" onClick={closeMenu}>Login</NavItem>
            )}

            {!loading && user && (
              <button
                className="w-full text-left px-3 py-2 rounded text-red-700 hover:bg-red-50"
                onClick={() => {
                  signout();
                  closeMenu();
                }}
                type="button"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

