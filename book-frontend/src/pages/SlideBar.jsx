import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Hope UI</h2>

      <nav>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "menu active" : "menu"
          }
        >
          Add Book
        </NavLink>

        <NavLink
          to="/books"
          className={({ isActive }) =>
            isActive ? "menu active" : "menu"
          }
        >
          Book Details
        </NavLink>
        <NavLink
          to="/students/add"
          className={({ isActive }) =>
            isActive ? "menu active" : "menu"
          }
        >
          Add Student
        </NavLink>
        <NavLink
          to="/students"
          className={({ isActive }) =>
            isActive ? "menu active" : "menu"
          }
        >
          Student Details
        </NavLink>
      </nav>
    </div>
  );
}