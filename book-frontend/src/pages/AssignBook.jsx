import "../styles/page.css";
import "../styles/form.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

export default function AssignBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [personName, setPersonName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadBook() {
      try {
        const res = await API.get(`books/${id}/`);
        setBook(res.data);
        // default price = book price
        setSellPrice(res.data.price);
      } catch (err) {
        console.log(err);
        alert("Failed to load book");
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id]);

  const handleSubmit = async () => {
    if (!personName.trim()) return alert("Enter person name");
    if (!quantity || Number(quantity) <= 0) return alert("Enter valid quantity");
    if (sellPrice === "" || Number(sellPrice) < 0) return alert("Enter valid price");

    setSubmitting(true);
    try {
      const res = await API.post(`books/${id}/assign/`, {
        person_name: personName.trim(),
        quantity: Number(quantity),
        sell_price: Number(sellPrice),
      });

      alert(res.data.message || "Assigned!");
      navigate("/"); // back to Book Details
    } catch (err) {
      console.log("Assign error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Assign failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!book) return <p style={{ padding: 40 }}>Book not found</p>;

  return (
    <div className="page">
      <div className="page-content">
        <div className="card">
          <h3>Assign Book</h3>

          <p style={{ marginTop: 6, color: "#6b7280" }}>
            <b>{book.title}</b> by {book.author} | Available: <b>{book.quantity}</b>
          </p>

          <div className="form-grid" style={{ marginTop: 18 }}>
            <div>
              <label>Person Name *</label>
              <input value={personName} onChange={(e) => setPersonName(e.target.value)} />
            </div>

            <div>
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <label>Selling Price (per book) *</label>
              <input
                type="number"
                step="0.01"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
              />
            </div>

            <div>
              <label>Total Amount</label>
              <input
                value={(Number(quantity || 0) * Number(sellPrice || 0)).toFixed(2)}
                disabled
              />
            </div>
          </div>

          <div className="actions" style={{ display: "flex", gap: 12 }}>
            <button onClick={handleSubmit} disabled={submitting || book.quantity <= 0}>
              {submitting ? "Assigning..." : "Submit"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              style={{ background: "#e5e7eb", color: "#111827" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}