import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ToastContext from "../contexts/ToastContext";
import { successClass } from "../utils/cssUtils";
import { emailRegex, passwordRegex } from "../utils/textUtils";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !username || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("L'email n'est pas valide.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    const formData = new FormData();
    formData.append("action", "register");
    formData.append("page", "users");
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await axios.post(
        axios.defaults.baseURL + "index.php",
        formData
      );
      if (response.status === 409) {
        setError("Email déjà utilisé.");
        return;
      }
      setEmail("");
      setPassword("");
      setUsername("");
      setConfirmPassword("");
      setError(null);
      showToast(
        "Votre compte a bien été créé. Veuillez vous connecter.",
        successClass
      );
      navigate("/login");
    } catch (error) {
      setError("Erreur lors de la connexion. Veuillez réessayer.");
    }
  };

  return (
    <div className="mb-4 mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="mb-3">S'inscrire</h2>
          <p className="mb-3">
            Le mot de passe doit contenir au moins 8 caractères, une majuscule,
            une minuscule et un chiffre.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Identifiant:
              </label>
              <input
                type="text"
                autoComplete="username"
                required={true}
                value={username}
                id="username"
                className="form-control"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email:
              </label>
              <input
                type="email"
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
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmer le mot de passe:
              </label>
              <input
                type="password"
                required={true}
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="d-flex flex-row justify-content-between">
              <button type="submit" className="btn btn-primary">
                S'inscrire
              </button>
              <Link to="/login" className="link-primary">
                Se connecter
              </Link>
            </div>
            {error && <p className="text-danger mt-3">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
