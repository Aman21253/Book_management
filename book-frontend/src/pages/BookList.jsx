import "../styles/page.css";
import "../styles/table.css";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await API.get("books/");
      // Handle both paginated and non-paginated responses
      const booksData = res.data.results || res.data;
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div className="page">
      <div className="page-content">
        <div className="card">
          <h2>Book Details</h2>

          <div className="table-wrapper">
            <table className="table fancy-table">
              <thead>
                <tr>
                  <th>Book ID</th>
                  <th>Book Name</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Price (₹)</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {books && books.length > 0 ? (
                  books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.id}</td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.price}</td>
                      <td>{book.quantity}</td>
                      <td className="action">👁️</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      No books found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (UI only for now) */}
          <div className="pagination">
            <button>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}