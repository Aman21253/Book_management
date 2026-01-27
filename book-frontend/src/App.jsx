import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/login";
import BookList from "./pages/BookList";
import AddBook from "./pages/AddBook";
import Layout from "./pages/layout";

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {!isLoginPage && (
        <Route
          path="/"
          element={
            <Layout>
              <BookList />
            </Layout>
          }
        />
      )}

      {!isLoginPage && (
        <Route
          path="/add"
          element={
            <Layout>
              <AddBook />
            </Layout>
          }
        />
      )}
    </Routes>
  );
}