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
  const [quantity, setQuantity] = useState("");

  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }

  async function handleAdd() {
    if (!title || !author || !isbn || !price || !quantity) {
      alert("All fields are required");
      return;
    }

    try {
      await API.post("books/", {
        title,
        author,
        isbn,
        price,
        quantity,
      });
      navigate("/");
    } catch {
      alert("ISBN must be unique and 13 digits");
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
              <input value={price} onChange={e => setPrice(e.target.value)} />
            </div>

            <div>
              <label>Quantity *</label>
              <input value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
          </div>

          <div className="actions">
            <button onClick={handleAdd}>Add Book</button>
          </div>
        </div>
      </div>
    </div>
  );
}