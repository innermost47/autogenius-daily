import React, { useContext, useState } from "react";
import { emailRegex } from "../utils/textUtils";
import { useAuth } from "../auth/authContext";
import axios from "axios";
import ToastContext from "../contexts/ToastContext";
import { errorClass, successClass } from "../utils/cssUtils";

function Contact() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [botControl, setBotControl] = useState("");
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const { showToast } = useContext(ToastContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() === "" || email.trim() === "" || message.trim() === "") {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("L'email n'est pas valide.");
      return;
    }
    const formData = new FormData();
    formData.append("sender", name);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("botcontrol", botControl);
    formData.append("page", "email");

    if (token) {
      formData.append("token", token);
    } else {
      formData.append("token", "");
    }
    try {
      const response = await axios.post(
        axios.defaults.baseURL + "index.php",
        formData
      );
      if (response.status === 200) {
        setEmail("");
        setMessage("");
        setName("");
        setError(null);
        showToast(
          "Votre message a bien été envoyé, AutoGenius vous répondra dans les plus brefs délais.",
          successClass
        );
      } else {
        showToast("Erreur lors de l'envoi. Veuillez réessayer.", errorClass);
      }
    } catch (error) {
      setError("Erreur lors de la connexion. Veuillez réessayer.");
    }
  };

  return (
    <div className="mt-4 mb-4">
      <h2 className="mb-3">Contact</h2>
      <p>
        <strong>Avertissement</strong> : Veuillez noter que ce formulaire de
        contact est alimenté par un modèle de langage IA. Bien que je reçoive
        votre message, c'est AutoGenius qui y répondra. Soyez assuré qu'il a été
        instruit pour répondre à votre message avec courtoisie et
        professionnalisme. Si vous avez des préoccupations concernant la
        soumission de votre message via ce formulaire, n'hésitez pas à me
        contacter directement sur mon site web. Merci de votre compréhension.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Nom
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            placeholder="Entrez votre nom"
            required
            value={name}
            autoComplete="family-name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Adresse email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Entrez votre email"
            required
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">
            Message
          </label>
          <textarea
            className="form-control"
            id="message"
            rows="10"
            placeholder="Entrez votre message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <input
          type="hidden"
          id="bot-control"
          value={botControl}
          onChange={(e) => setBotControl(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Envoyer
        </button>
        {error && <p className="text-danger mt-3">{error}</p>}
      </form>
    </div>
  );
}

export default Contact;
