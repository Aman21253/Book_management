import "../styles/page.css";
import "../styles/table.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";

const PAGE_SIZE = 10;

export default function BookList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0); // total records
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // to disable assign button while assigning
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    // if search changes => reset page to 1
    setPage(1);
  }, [q]);

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, [q, page]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await API.get("books/", {
        params: {
          ...(q ? { q } : {}),
          page,
          page_size: PAGE_SIZE,
        },
      });

      // ✅ DRF pagination format: {count, results, next, previous}
      if (res.data && typeof res.data === "object" && "results" in res.data) {
        setBooks(Array.isArray(res.data.results) ? res.data.results : []);
        setCount(Number(res.data.count || 0));
      } else {
        // ✅ non-paginated array fallback
        const arr = Array.isArray(res.data) ? res.data : [];
        setCount(arr.length);
        // client-side slice as fallback
        const start = (page - 1) * PAGE_SIZE;
        setBooks(arr.slice(start, start + PAGE_SIZE));
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ pagination helpers
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goToPage = (p) => setPage(p);

  // show max 5 page buttons (like 1 2 3 4 5)
  const getPageButtons = () => {
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    // adjust start if we're near the end
    start = Math.max(1, end - maxButtons + 1);

    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
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

          {/* ✅ Pagination */}
          <div className="pagination" style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
            <button onClick={goPrev} disabled={page === 1}>
              Previous
            </button>

            {getPageButtons().map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={p === page ? "active" : ""}
              >
                {p}
              </button>
            ))}

            <button onClick={goNext} disabled={page === totalPages}>
              Next
            </button>
          </div>

          {/* optional: show count */}
          <p style={{ textAlign: "center", marginTop: 10, color: "#6b7280" }}>
            Page {page} of {totalPages} • Total books: {count}
          </p>
        </div>
      </div>
    </div>
  );
}