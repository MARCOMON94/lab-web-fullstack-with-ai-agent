import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo-token-12345");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/chat");
    } catch {
      setError("No se pudo iniciar sesión. Revisa el token.");
    }
  }

  return (
    <main className="page">
      <section className="card login-card">
        <h1>Login</h1>
        <p>Introduce cualquier email y el token demo como contraseña.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              value={email}
              placeholder="demo@email.com"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Token
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}