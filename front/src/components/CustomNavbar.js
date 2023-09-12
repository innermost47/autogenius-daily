import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth } from "../auth/authContext";
import { Navbar, Nav, Image, Button } from "react-bootstrap";

function CustomNavbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <LinkContainer to="/">
        <Navbar.Brand className="ms-3">
          <Image
            src={`${process.env.PUBLIC_URL}/images/logo.svg`}
            alt="logo"
            className="logo"
          />
        </Navbar.Brand>
      </LinkContainer>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" className="me-3" />
      <Navbar.Collapse id="responsive-navbar-nav" className="ms-3">
        <Nav className="me-auto">
          <LinkContainer to="/">
            <Nav.Link>Accueil</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/about">
            <Nav.Link>A propos</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/contact">
            <Nav.Link>Contact</Nav.Link>
          </LinkContainer>
        </Nav>{" "}
        {!isAuthenticated ? (
          <div className="me-3">
            <LinkContainer to="/login">
              <Button variant="primary" size="sm" className="me-3">
                Connexion
              </Button>
            </LinkContainer>
            <LinkContainer to="/register">
              <Button variant="success" size="sm">
                S'inscrire
              </Button>
            </LinkContainer>
          </div>
        ) : (
          <Button variant="danger" onClick={logout} size="sm" className="me-3">
            Deconnexion
          </Button>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
export default CustomNavbar;
