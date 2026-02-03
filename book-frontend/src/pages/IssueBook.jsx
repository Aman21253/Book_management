import "../styles/page.css";
import "../styles/table.css";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function IssueBook() {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState("");
  const [issueDate, setIssueDate] = useState(""); // optional

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState(null); // store response to show transaction id

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, booksRes] = await Promise.all([
        API.get("students/"),
        API.get("books/", { params: { page: 1, page_size: 200 } }),
      ]);

      // students: may be paginated or array
      const sData = studentsRes.data;
      const sList = sData?.results ? sData.results : Array.isArray(sData) ? sData : [];
      setStudents(sList);

      // books: may be paginated or array
      const bData = booksRes.data;
      const bList = bData?.results ? bData.results : Array.isArray(bData) ? bData : [];
      setBooks(bList);
    } catch (err) {
      console.error("Error loading form data:", err);
      alert("Failed to load students/books");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId || !bookId) {
      alert("Please select both Student and Book");
      return;
    }

    try {
      setSubmitting(true);
      setResult(null);

      const payload = {
        student_id: Number(studentId),
        book_id: Number(bookId),
        ...(issueDate ? { issue: issueDate } : {}),
      };

      const res = await API.post("assignments/issue/", payload);

      setResult(res.data);
      alert(res.data.message || "Book issued successfully!");

      // reset form (optional)
      setStudentId("");
      setBookId("");
      setIssueDate("");
    } catch (error) {
      console.log("Issue error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to issue book");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div className="page">
      <div className="page-content">
        <div className="card">
          <h2>Issue Book</h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {/* Student */}
            <div style={{ display: "grid", gap: 6 }}>
              <label>Student</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={inputStyle}
              >
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Book */}
            <div style={{ display: "grid", gap: 6 }}>
              <label>Book</label>
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                style={inputStyle}
              >
                <option value="">-- Select Book --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id} disabled={Number(b.quantity) <= 0}>
                    {b.title} — {b.author} (Qty: {b.quantity})
                  </option>
                ))}
              </select>
              <small style={{ color: "#6b7280" }}>
                Books with quantity 0 are disabled.
              </small>
            </div>

            {/* Issue Date (optional) */}
            <div style={{ display: "grid", gap: 6 }}>
              <label>Issue Date (optional)</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              {submitting ? "Issuing..." : "Issue Book"}
            </button>
          </form>

          {/* ✅ Show Transaction ID result */}
          {result?.transaction_id && (
            <div
              style={{
                marginTop: 18,
                padding: 12,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#f9fafb",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: 8 }}>Issued Successfully ✅</h3>
              <p style={{ margin: 0 }}>
                <b>Transaction ID:</b>{" "}
                <span style={{ wordBreak: "break-word" }}>{result.transaction_id}</span>
              </p>
              {result.assignment?.book_title && (
                <p style={{ margin: "6px 0 0 0" }}>
                  <b>Book:</b> {result.assignment.book_title}
                </p>
              )}
              {result.assignment?.student_name && (
                <p style={{ margin: "6px 0 0 0" }}>
                  <b>Student:</b> {result.assignment.student_name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
};