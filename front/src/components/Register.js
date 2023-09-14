import React, { useContext, useEffect, useState } from "react";
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
  const [disabled, setDisabled] = useState(true);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const [hasEightChars, setHasEightChars] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordEquals, setPasswordEquals] = useState(false);

  useEffect(() => {
    setHasEightChars(password.length >= passwordRegex.caractersMinLen);
    setHasUppercase(passwordRegex.uppercase.test(password));
    setHasLowercase(passwordRegex.lowercase.test(password));
    setHasNumber(passwordRegex.digit.test(password));
    setHasSpecialChar(passwordRegex.specialCaracter.test(password));
    setPasswordEquals(password === confirmPassword);
    if (!passwordEquals) {
      setDisabled(true);
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError(null);
    setDisabled(false);
  }, [password, confirmPassword, passwordEquals]);

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
    if (
      !hasEightChars ||
      !hasUppercase ||
      !hasLowercase ||
      !hasNumber ||
      !hasSpecialChar
    ) {
      setError("Mot de passe trop faible.");
      return;
    }
    if (!passwordEquals) {
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
    } finally {
      setDisabled(true);
    }
  };

  return (
    <div className="mb-4 mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="mb-3">S'inscrire</h2>
          <div className="mb-3">
            <p className="mb-1">
              <strong>Le mot de passe doit contenir:</strong>
            </p>
            <ul>
              <li className={hasEightChars ? "text-success" : "text-danger"}>
                au moins 8 caractères
              </li>
              <li className={hasUppercase ? "text-success" : "text-danger"}>
                une majuscule
              </li>
              <li className={hasLowercase ? "text-success" : "text-danger"}>
                une minuscule
              </li>
              <li className={hasSpecialChar ? "text-success" : "text-danger"}>
                un caractère spécial
              </li>
              <li className={hasNumber ? "text-success" : "text-danger"}>
                et un chiffre
              </li>
            </ul>
          </div>
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={disabled}
              >
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
