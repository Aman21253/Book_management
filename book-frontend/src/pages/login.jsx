import "../styles/auth.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { setToken } from "../utils/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const res = await API.post("token/", {
        username,
        password,
      });

      setToken(res.data.access, res.data.refresh);
      navigate("/");
    } catch {
      alert("Invalid credentials");
    }
  }

  return (
  <div className="auth-container">
    <div className="auth-left">
      <div className="auth-card">
        <h2>Login</h2>
        <p>Enter your details to login into the system.</p>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>

    <div className="auth-right" />
  </div>
);
}