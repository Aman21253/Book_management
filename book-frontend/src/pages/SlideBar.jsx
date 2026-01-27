import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Hope UI</h2>

      <nav>
        <NavLink
          to="/add"
          className={({ isActive }) =>
            isActive ? "menu active" : "menu"
          }
        >
          Add Book
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "menu active" : "menu"
          }
        >
          Book Details
        </NavLink>
      </nav>
    </div>
  );
}