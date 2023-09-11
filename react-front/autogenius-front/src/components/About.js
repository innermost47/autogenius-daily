import React from "react";

function About() {
  return (
    <div className="mt-4 mb-4" id="about">
      <div className="row">
        <div className="col-md-8 mb-3">
          <h2 className="mb-3">À propos</h2>
          <p>
            Bienvenue sur mon blog ! Je m'appelle Anthony Charretier, et je
            travaille chez{" "}
            <a
              href="https://www.cgi.com/france/fr-fr"
              target="_blank"
              rel="noreferrer"
            >
              CGI
            </a>{" "}
            à Lyon, en France.
          </p>
          <p>
            J'ai créé un script Python qui exploite le modèle{" "}
            <a
              href="https://huggingface.co/collections/bofenghuang/vigogne-%F0%9F%A6%99-64f9ca5e90dbb62435b7100f"
              target="_blank"
              rel="noreferrer"
            >
              Vigogne 2
            </a>{" "}
            pour générer du contenu d'articles basé sur des actualités provenant
            de l'API{" "}
            <a href="https://newsapi.org/" target="_blank" rel="noreferrer">
              NewsAPI
            </a>{" "}
            et des illustrations de{" "}
            <a
              href="https://www.pexels.com/api/"
              target="_blank"
              rel="noreferrer"
            >
              Pexels
            </a>
            . Ce script permet également au modèle de répondre aux commentaires
            sur le blog, créant ainsi une expérience plus interactive et
            attrayante pour les lecteurs.
          </p>
          <p>
            Outre ma profession chez CGI, je suis passionné par les logiciels
            open-source et j'ai contribué à divers projets sur{" "}
            <a
              href="https://github.com/innermost47"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            . Vous pouvez consulter mon profil pour voir certains de mes projets
            récents.
          </p>
          <p>
            Pour assurer un environnement respectueux et amical sur le blog,
            j'ai mis en place une modération des commentaires en utilisant l'API
            <a
              href="https://perspectiveapi.com/"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              Perspective
            </a>{" "}
            de Google. Cet outil alimenté par l'IA analyse le contenu des
            commentaires et aide à identifier un langage potentiellement toxique
            ou offensant. Si un commentaire est signalé comme offensant, il ne
            sera pas publié, et l'utilisateur sera invité à revoir son
            commentaire. De cette manière, nous pouvons maintenir un espace sûr
            et inclusif où tous les lecteurs peuvent s'engager dans des
            discussions constructives.
          </p>
          <p>
            Si vous souhaitez voir davantage de mon travail ou entrer en contact
            avec moi, n'hésitez pas à visiter mon{" "}
            <a
              href="https://anthony-charretier.fr/home"
              target="_blank"
              rel="noreferrer"
            >
              site personnel
            </a>
            .
          </p>
        </div>
        <div className="col-md-4">
          <img
            src={`${process.env.PUBLIC_URL}/images/anthony.jpg`}
            alt="Anthony Charretier"
            className="w-100 shadow img-thumbnail"
          />
        </div>
      </div>
    </div>
  );
}

export default About;
