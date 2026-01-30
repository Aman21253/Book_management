import "../styles/page.css";
import "../styles/table.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";

export default function BookList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // to disable assign button while assigning
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, [q]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await API.get("books/", {
        params: q ? { q } : {},
      });

      const booksData = res.data.results || res.data;
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (bookId) => {
    try {
      setAssigningId(bookId);

      const res = await API.post(`books/${bookId}/assign/`);

      // ✅ update quantity locally without refetch
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? { ...b, quantity: res.data.remaining_quantity }
            : b
        )
      );

      alert(res.data.message || "Assigned successfully!");
    } catch (error) {
      console.log("Assign book error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to assign book");
    } finally {
      setAssigningId(null);
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
                {books.length > 0 ? (
                  books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.id}</td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.price}</td>
                      <td>{book.quantity}</td>

                      <td className="action">
                        {/* ✅ Assign button */}
                        <button
                          onClick={() => handleAssign(book.id)}
                          disabled={book.quantity <= 0 || assigningId === book.id}
                          style={{
                            marginRight: "10px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            cursor:
                              book.quantity <= 0 || assigningId === book.id
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              book.quantity <= 0 || assigningId === book.id ? 0.6 : 1,
                            background: "#fff",
                            fontSize: "13px",
                          }}
                          title={book.quantity <= 0 ? "Out of stock" : "Assign book"}
                        >
                          {assigningId === book.id ? "Assigning..." : "Assign"}
                        </button>

                        {/* Chat / details */}
                        <button
                          onClick={() => navigate(`/books/${book.id}/chat`)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                          }}
                          title="Open chat"
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

          {/* Pagination UI (optional) */}
          <div className="pagination">
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}