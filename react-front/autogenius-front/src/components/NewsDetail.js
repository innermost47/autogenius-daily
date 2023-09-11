import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import OtherNews from "./OtherNews";
import { formatDate } from "../utils/datesUtils";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";

function NewsDetail() {
  const [newsItem, setNewsItem] = useState(null);
  const { slug: newsSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${axios.defaults.baseURL}index.php?page=articles&slug=${newsSlug}`)
      .then((response) => {
        setNewsItem(response.data);
      });
  }, [newsSlug]);

  if (!newsItem) return <div>Chargement...</div>;

  const articleDate = new Date(newsItem.article.created_at);
  const formattedDate = formatDate(articleDate);

  function handleSubmit(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");

      return;
    }
    // Reste de la logique de soumission du commentaire ici
  }

  return (
    <div className="mt-4 row">
      <div className="col-md-8">
        <img
          src={newsItem.article.image_url}
          alt={newsItem.article.slug}
          className="w-100 mb-4 rounded"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            height: "400px",
          }}
        />
        <h2 className="mb-4">{newsItem.article.title}</h2>
        <p className="text-muted blockquote-footer mt-3">{formattedDate}</p>
        <p className="mb-4">{newsItem.article.content}</p>
        <h3>Commentaires</h3>
        {newsItem.comments.length > 0 ? (
          <>
            {newsItem.comments.map((comment) => (
              <div className="row comment-container" key={comment.id}>
                <div className="col-md-12">
                  <div className="comment">
                    <div className="username">{comment.username}</div>
                    <div>{comment.content}</div>
                    <div className="timestamp">{comment.created_at}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p>
            Il n'y a pas encore de commentaires pour cet article. Soyez le
            premier à commenter !
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="comment" className="form-label">
              Laisser un commentaire
            </label>
            <textarea className="form-control" id="comment" rows="3"></textarea>
          </div>
          <input type="hidden" id="articleId" value={newsItem.article.id} />
          <button type="submit" className="btn btn-primary mb-3">
            Soumettre
          </button>
          <p id="moderation" className="text-danger"></p>
        </form>
      </div>
      <OtherNews />
    </div>
  );
}

export default NewsDetail;
