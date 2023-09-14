import React, { useState, useEffect } from "react";
import CategoryFilter from "./CategoryFilter";
import axios from "axios";
import { formatDate } from "../utils/datesUtils";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { truncateText } from "../utils/textUtils";

function NewsList() {
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 9;

  useEffect(() => {
    let url = axios.defaults.baseURL + "index.php?page=articles";
    if (category !== "all") {
      url += `&category=${category}`;
    }
    axios.get(url).then((response) => {
      setNews(response.data);
    });
  }, [category]);

  const handlePageClick = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
    const topOfSection = document.getElementById("articles");
    if (topOfSection) {
      topOfSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const displayedNews = news.slice(
    currentPage * perPage,
    (currentPage + 1) * perPage
  );

  return (
    <div>
      <CategoryFilter setCategory={setCategory} />
      <div className="row">
        {displayedNews.map((item) => {
          const articleDate = new Date(item.created_at);
          const formattedDate = formatDate(articleDate);

          return (
            <div className="col-md-4 mb-4" key={item.id}>
              <div className="card shadow" id={`post-${item.id}`}>
                <img
                  src={item.image_url}
                  className="card-img-top article-image"
                  alt={item.title}
                  loading="lazy"
                />
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="card-text text-justify">
                    {truncateText(item.short_content, 512)}
                  </p>
                  <p className="card-text text-muted blockquote-footer mt-3">
                    {formattedDate}
                  </p>
                  <Link className="btn btn-primary" to={`/news/${item.slug}`}>
                    En savoir plus
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="d-flex flex-row justify-content-center">
        <ReactPaginate
          previousLabel=<FontAwesomeIcon icon={faArrowLeft} />
          nextLabel=<FontAwesomeIcon icon={faArrowRight} />
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          onPageChange={handlePageClick}
          containerClassName="pagination"
          activeClassName="active"
          pageCount={Math.ceil(news.length / perPage)}
          marginPagesDisplayed={1}
          pageRangeDisplayed={1}
        />
      </div>
    </div>
  );
}

export default NewsList;
