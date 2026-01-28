import "../styles/page.css";
import "../styles/table.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function BookList() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await API.get("books/");
      const booksData = res.data.results || res.data; // supports paginated/non-paginated
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
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
                      <td className="action">
                        <button
                          onClick={() => navigate(`/books/${book.id}/chat`)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                          }}
                          title="Open chat history"
                        >
                          👁️
                        </button>
                      </td>
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
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button disabled>2</button>
            <button disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}