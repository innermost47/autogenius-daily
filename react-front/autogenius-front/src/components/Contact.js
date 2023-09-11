import React from "react";

function Contact() {
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
      <form>
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
            autoComplete="family-name"
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
            autoComplete="email"
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
          ></textarea>
        </div>
        <input type="hidden" id="bot-control" />
        <button type="submit" className="btn btn-primary">
          Envoyer
        </button>
      </form>
    </div>
  );
}

export default Contact;
