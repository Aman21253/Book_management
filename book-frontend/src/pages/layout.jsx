import Sidebar from "./Slidebar";
import Header from "./Header";
import "../styles/layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Header />

        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}