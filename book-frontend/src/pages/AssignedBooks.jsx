import "../styles/page.css";
import "../styles/table.css";
import { useEffect, useState } from "react";
import API from "../api/axios";

const PAGE_SIZE = 10;

export default function AssignedBooks() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // disable return button while returning
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line
  }, [page]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await API.get("assignments/", {
        params: {
          page,
          page_size: PAGE_SIZE,
        },
      });

      // ✅ DRF pagination format
      if (res.data && typeof res.data === "object" && "results" in res.data) {
        setAssignments(Array.isArray(res.data.results) ? res.data.results : []);
        setCount(Number(res.data.count || 0));
      } else {
        // ✅ non-paginated array fallback
        const arr = Array.isArray(res.data) ? res.data : [];
        setCount(arr.length);

        // client-side slice (fallback)
        const start = (page - 1) * PAGE_SIZE;
        setAssignments(arr.slice(start, start + PAGE_SIZE));
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (assignmentId) => {
    try {
      setReturningId(assignmentId);

      const res = await API.post("assignments/return_item/", {
        assignment_id: assignmentId,
        // return_date: "2026-02-02"  // optional, backend will auto today if not sent
      });

      alert(res.data.message || "Returned successfully!");

      // ✅ refresh list after return
      fetchAssignments();
    } catch (error) {
      console.log("Return error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to return book");
    } finally {
      setReturningId(null);
    }
  };

  // ✅ pagination helpers (same as your code)
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goToPage = (p) => setPage(p);

  const getPageButtons = () => {
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

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
          <h2>Assigned Books</h2>

          <div className="table-wrapper">
            <table className="table fancy-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Transaction ID</th>
                  <th>Book</th>
                  <th>Student</th>
                  <th>Issue</th>
                  <th>Return</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {assignments.length > 0 ? (
                  assignments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td style={{ maxWidth: 220, wordBreak: "break-word" }}>
                        {a.transaction_id}
                      </td>
                      <td>{a.book_title || a.book}</td>
                      <td>{a.student_name || a.student}</td>
                      <td>{a.issue || "-"}</td>
                      <td>{a.return_date || "-"}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: 12,
                            textTransform: "capitalize",
                            border: "1px solid #e5e7eb",
                            background:
                              a.status === "issued" ? "#FEF3C7" : "#D1FAE5",
                          }}
                        >
                          {a.status}
                        </span>
                      </td>

                      <td className="action">
                        {a.status === "issued" ? (
                          <button
                            onClick={() => handleReturn(a.id)}
                            disabled={returningId === a.id}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1px solid #e5e7eb",
                              cursor: "pointer",
                            }}
                          >
                            {returningId === a.id ? "Returning..." : "Return"}
                          </button>
                        ) : (
                          <span style={{ color: "#6b7280" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                      No assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination */}
          <div
            className="pagination"
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginTop: 18,
            }}
          >
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

          <p style={{ textAlign: "center", marginTop: 10, color: "#6b7280" }}>
            Page {page} of {totalPages} • Total assignments: {count}
          </p>
        </div>
      </div>
    </div>
  );
}