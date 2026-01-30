import "../styles/page.css";
import "../styles/form.css";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";
import API from "../api/axios";

export default function AddBook() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [about, setAbout] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }

  async function generateSummary() {
    if (!title || !author) {
      alert("Please enter book title and author name to generate summary");
      return;
    }

    setSummaryLoading(true);
    try {
      const response = await API.post("books/generate_summary/", {
        title,
        author,
      });
      setAbout(response.data.summary);
      alert("Summary generated successfully!");
    } catch (error) {
      console.log("Generate summary error:", error.response?.data || error.message);
      alert("Error generating summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleAdd() {
    if (!title || !author || !isbn || !price || !quantity) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await API.post("books/", {
        title: title.trim(),
        author: author.trim(),
        isbn: String(isbn).trim(),
        price: Number(price),
        quantity: Number(quantity),
        about: about || "",
      });
      navigate("/");
    } catch (error) {
      console.log("Add book error:", error.response?.data || error.message);
      alert("Error adding book. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="card">
          <h3>Add Book</h3>

          <div className="form-grid">
            <div>
              <label>Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div>
              <label>Author *</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} />
            </div>

            <div>
              <label>ISBN *</label>
              <input value={isbn} onChange={e => setIsbn(e.target.value)} />
            </div>

            <div>
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label>Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label>About / Summary</label>
              <textarea 
                value={about} 
                onChange={e => setAbout(e.target.value)}
                rows="4"
                placeholder="Summary of the book"
              />
              {/* <button 
                type="button"
                onClick={generateSummary}
                disabled={summaryLoading || !title || !author}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: summaryLoading ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: summaryLoading ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                {summaryLoading ? "Generating..." : "Generate Summary with AI"}
              </button> */}
            </div>
          </div>

          <div className="actions">
            <button onClick={handleAdd} disabled={loading}>
              {loading ? "Adding..." : "Add Book"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}