import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import OtherNews from "./OtherNews";
import { formatDate } from "../utils/datesUtils";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import ToastContext from "../contexts/ToastContext";
import { errorClass, successClass } from "../utils/cssUtils";

function NewsDetail() {
  const [newsItem, setNewsItem] = useState(null);
  const [comment, setComment] = useState("");
  const [moderation, setModeration] = useState("");
  const { slug: newsSlug } = useParams();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const fetchNewsDetail = useCallback(() => {
    axios
      .get(`${axios.defaults.baseURL}index.php?page=articles&slug=${newsSlug}`)
      .then((response) => {
        setNewsItem(response.data);
      });
  }, [newsSlug]);

  useEffect(() => {
    fetchNewsDetail();
  }, [fetchNewsDetail]);

  if (!newsItem) return <div>Chargement...</div>;

  const articleDate = new Date(newsItem.article.created_at);
  const formattedDate = formatDate(articleDate);

  function handleSubmit(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      showToast("Vous devez vous connecter pour commenter.", errorClass);
      return;
    }
    if (comment === "") {
      showToast("Veuillez écrire un commentaire.", errorClass);
      return;
    }
    if (comment.length > 255) {
      showToast(
        "Le commentaire ne doit pas dépasser 255 caractères.",
        errorClass
      );
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("page", "comments");
    formData.append("content", comment);
    formData.append("article_id", newsItem.article.id);

    axios
      .post(`${axios.defaults.baseURL}index.php`, formData)
      .then((response) => {
        setComment("");
        if (response.message === "moderation") {
          setModeration(
            "Votre commentaire a été flaggé comme offensant. Veuillez réviser votre commentaire et réessayer."
          );
        } else {
          showToast("Votre commentaire a bien été ajouté.", successClass);
          fetchNewsDetail();
        }
      });
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
          <div className="row comment-container">
            {newsItem.comments.map((comment) => (
              <div className="col-md-12" key={comment.id}>
                <div className="mt-4 mb-4">
                  <div className="blockquote-footer mb-1">
                    {comment.username}
                  </div>
                  <div>{comment.content}</div>
                  <div className="text-muted fst-italic mt-2">
                    <small>{comment.created_at}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <textarea
              className="form-control"
              id="comment"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary mb-3">
            Soumettre
          </button>
          <p id="moderation" className="text-danger">
            {moderation}
          </p>
        </form>
      </div>
      <OtherNews />
    </div>
  );
}

export default NewsDetail;
