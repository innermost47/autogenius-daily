import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="container-fluid mt-4 text-center bg-dark text-light p-3">
      <p>&copy; 2023 AutoGenius Daily. Tous droits réservés.</p>
      <div className="d-flex justify-content-center align-items-center">
        <Link className="pointer link-light" to="privacy-policy">
          Politique de Confidentialité
        </Link>
        <span className="mx-2">|</span>
        <Link className="pointer link-light" to="legals">
          Mentions Légales
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
