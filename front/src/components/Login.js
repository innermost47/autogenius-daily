import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/authContext";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    const formData = new FormData();
    formData.append("action", "login");
    formData.append("page", "users");
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await axios.post(
        axios.defaults.baseURL + "index.php",
        formData
      );
      const token = response.data.token;
      login(token);
      setEmail("");
      setPassword("");
      setError(null);
      navigate("/");
    } catch (error) {
      setError("Erreur lors de la connexion. Veuillez réessayer.");
    }
  };

  return (
    <div className="mb-4 mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="mb-3">Connexion</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email:
              </label>
              <input
                type="email"
                autoComplete="email"
                required={true}
                value={email}
                id="email"
                className="form-control"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Mot de passe:
              </label>
              <input
                type="password"
                required={true}
                autoComplete="current-password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="d-flex flex-row justify-content-between">
              <button type="submit" className="btn btn-primary">
                Se connecter
              </button>
              <Link to="/register" className="link-primary">
                S'inscrire
              </Link>
            </div>
            {error && <p className="text-danger mt-3">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
