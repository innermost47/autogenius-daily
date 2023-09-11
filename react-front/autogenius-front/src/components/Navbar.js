import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function Navbar() {
  const { isAuthenticated, login, logout } = useAuth();
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img
            src={`${process.env.PUBLIC_URL}/images/logo.svg`}
            alt="logo"
            className="logo"
          />
          AutoGenius Daily
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Accueil
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="about">
                A propos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="contact">
                Contact
              </Link>
            </li>
            {!isAuthenticated ? (
              <>
                {" "}
                <li className="nav-item">
                  <Link className="text-light nav-link" onClick={login}>
                    Connexion
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="text-light nav-link" id="signupButton">
                    S'inscrire
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="text-danger nav-link" onClick={logout}>
                  Deconnexion
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
