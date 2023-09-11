import React, { useState, useEffect } from "react";
import axios from "axios";
import { capitalizeFirstLetter } from "../utils/textUtils";

function CategoryFilter({ setCategory }) {
  const [categoryItem, setCategoryItem] = useState(null);

  useEffect(() => {
    axios
      .get(`${axios.defaults.baseURL}index.php?page=categories`)
      .then((response) => {
        setCategoryItem(response.data);
      });
  }, []);
  return (
    <div className="mt-4 mb-4" id="articles">
      <h2>Derniers articles</h2>
      <div className="row height d-flex justify-content-start align-items-center">
        <div className="col-md-8">
          <select
            onChange={(e) => setCategory(e.target.value)}
            className="form-select mt-1"
          >
            <option value="all">Tous</option>
            {categoryItem &&
              categoryItem.map((item) => (
                <option key={item.id} value={item.id}>
                  {capitalizeFirstLetter(item.name)}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default CategoryFilter;
