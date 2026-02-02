import "../styles/page.css";
import "../styles/form.css";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";
import API from "../api/axios";

export default function AddBook() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  const handleAdd = async () => {
    if (!name || !email || !phone || !address) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await API.post("students/", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      navigate("/students");
    } catch (error) {
      console.log("Add student error:", error.response?.data || error.message);
      alert("Error adding student. Please try again.");
    } finally {
      setLoading(false);
    }
  };
    return (
        <div className="page">
            <div className="page-content">
                <div className="card-8">
                    <h3>Add Student</h3>
                    <div className="form-grid">
                        <div>
                            <label>Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label>Email</label>
                            <input value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label>Phone</label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div>
                            <label>Address</label>
                            <input value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                    </div>
                    <div className="actions">
                        <button onClick={handleAdd} disabled={loading}>
                            {loading ? "Adding..." : "Add Student"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

}