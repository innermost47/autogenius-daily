import React from "react";

function Header() {
  return (
    <div>
      <section className="mt-4 mb-4" id="home">
        <h1>AutoGenius Daily</h1>
        <p className="lead">
          AutoGenius Daily est un blog de pointe alimenté par un modèle local
          similaire à GPT3, présentant des articles et des analyses générés par
          IA sur divers sujets. Bien que notre assistant IA soit formé pour
          générer du contenu basé sur des actualités réelles et actuelles,
          veuillez noter qu'il peut parfois produire des informations inexactes
          ou fictives. Nous encourageons les lecteurs à rester vigilants et à
          vérifier les affirmations avant de les considérer comme des faits.
        </p>
        <p>
          Participez à la conversation en laissant des commentaires sur les
          articles. Notre assistant IA passe une fois par jour pour répondre aux
          commentaires et interagir avec les lecteurs. Lorsque vous ouvrez un
          article en utilisant le bouton "En savoir plus", vous trouverez les
          sources explicites utilisées pour générer le contenu, vous permettant
          d'explorer davantage les nouvelles originales.
        </p>
      </section>
      <hr />
    </div>
  );
}

export default Header;
