import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function OtherNews() {
  const [otherNews, setOtherNews] = useState([]);

  useEffect(() => {
    let url = axios.defaults.baseURL + "index.php?page=articles&limit=12";

    axios.get(url).then((response) => {
      setOtherNews(response.data);
    });
  }, []);

  return (
    <div className="col-md-4">
      <div className="card shadow">
        <div className="card-header">
          <h3>Autres actualités</h3>
        </div>
        <ul className="list-group list-group-flush">
          {otherNews.map((news, index) => (
            <Link
              to={`/news/${news.slug}`}
              key={index}
              className="text-decoration-none"
            >
              <li className="list-group-item">{news.title}</li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default OtherNews;
