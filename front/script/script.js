import { apiUrl } from "./config.js";

const passwordInput = document.getElementById("passwordSignup");
const passwordHelp = document.getElementById("passwordHelp");
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const registerModal = new bootstrap.Modal(
  document.getElementById("registerModal")
);
const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
const logoutModal = new bootstrap.Modal(document.getElementById("logoutModal"));
const commentForm = document.getElementById("commentForm");
const commentTextarea = document.getElementById("comment");
const commentSubmit = document.getElementById("commentSubmit");
const articleModal = new bootstrap.Modal(
  document.getElementById("articleModal")
);
const shareModal = new bootstrap.Modal(document.getElementById("shareModal"));
const registrationError = document.getElementById("registrationError");
const loginError = document.getElementById("loginError");
registrationError.textContent = "";
loginError.textContent = "";
const moderation = document.getElementById("moderation");
const sources = document.getElementById("sources");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const name = document.getElementById("name");
const message = document.getElementById("message");
const email = document.getElementById("email");
const botControl = document.getElementById("bot-control");
const emailMessageToast = new bootstrap.Toast(
  document.getElementById("emailSuccessToast")
);
const nameControl = document.getElementById("nameControl");
const emailControl = document.getElementById("emailControl");
const messageControl = document.getElementById("messageControl");
const shareButton = document.getElementById("shareButton");
const facebookLink = document.getElementById("facebookLink");
const twitterLink = document.getElementById("twitterLink");
const linkedinLink = document.getElementById("linkedinLink");
const articlesContainer = document.getElementById("articlesContainer");
const urlParams = new URLSearchParams(window.location.search);
const articlesPerPage = 9;
const initialPage = urlParams.get("page") || null;
const initialCategory = urlParams.get("category") || null;
let totalArticles;
let totalPages;
let selectedCategory = null;
let firstLoad = true;
let pageNumber;
nameControl.value = "";
emailControl.value = "";
messageControl.value = "";
if (initialPage && initialCategory) {
  firstLoad = false;
}

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function validatePassword(passwordInput) {
  if (passwordPattern.test(passwordInput.value)) {
    passwordInput.setCustomValidity("");
    passwordHelp.textContent = "";
  } else {
    passwordInput.setCustomValidity(
      "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    );
    passwordHelp.textContent =
      "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)";
  }
}

function createPagination(totalPages) {
  const paginationContainer = document.getElementById("pagination");
  while (paginationContainer.firstChild) {
    paginationContainer.removeChild(paginationContainer.firstChild);
  }

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.add("btn-success", "btn", "me-2", "page-button");
    pageButton.setAttribute("data-page-number", i);
    pageButton.addEventListener("click", () => {
      showPage(i);
    });
    paginationContainer.appendChild(pageButton);
  }
}

function showPage(pageNumber, firstLoad = false) {
  const offset = (pageNumber - 1) * articlesPerPage;

  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  if (categoryParam) {
    selectedCategory = categoryParam;
  }

  loadArticles(selectedCategory, offset);
  if (!firstLoad) {
    document.getElementById("articles").scrollIntoView();
  }
  const currentHash = window.location.hash;
  if (!firstLoad) {
    urlParams.set("page", pageNumber);
    const newPathname = window.location.pathname;
    window.history.pushState(
      null,
      "",
      `${newPathname}?${urlParams.toString()}${currentHash}`
    );
  } else {
    const newPathname = window.location.pathname;
    if (currentHash) {
      window.history.pushState(
        null,
        "",
        `${newPathname}?${urlParams.toString()}${currentHash}`
      );
    } else {
      window.history.pushState(null, "", newPathname);
    }
  }
}

function updateUrlWithPage(pageNumber, category) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("page", pageNumber);
  if (category !== "all" && category != undefined) {
    urlParams.set("category", category);
  } else {
    urlParams.delete("category");
  }
  const currentHash = window.location.hash;
  const hashSegment = currentHash ? currentHash : "";
  window.history.pushState(
    null,
    "",
    window.location.pathname + "?" + urlParams.toString() + hashSegment
  );
}

function loadArticle(data) {
  const articleDate = new Date(data.article.created_at);
  const formattedDate = formatDate(articleDate);
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(data.article.content, "text/html");
  const textContent = htmlDoc.body.textContent;
  const htmlTitle = parser.parseFromString(data.article.title, "text/html").body
    .textContent;
  document.getElementById("articleModalImage").src = data.article.image_url;
  document.getElementById("articleModalImage").setAttribute("loading", "lazy");
  document.getElementById("articleModalImage").alt = htmlTitle;
  document.getElementById("articleModalLabel").textContent = htmlTitle;
  document.getElementById("articleModalContent").textContent = textContent;
  const sourcesString = data.article.sources;
  const sourcesDataIntermediate = JSON.parse(sourcesString);
  const sourcesData = JSON.parse(sourcesDataIntermediate);
  window.location.hash = data.article.slug;
  for (const src in sourcesData) {
    if (sourcesData.hasOwnProperty(src)) {
      const link = document.createElement("a");
      link.href = sourcesData[src];
      link.target = "_blank";
      link.style.display = "block";
      link.textContent = "Source";
      sources.appendChild(link);
    }
  }
  document.getElementById("articleModaldate").textContent = formattedDate;
  document.getElementById("article-id").value = data.article.id;
  shareButton.onclick = () => {
    facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
    twitterLink.href = `https://twitter.com/intent/tweet?url=${window.location.href}`;
    linkedinLink.href = `https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`;
    shareModal.show();
  };

  const commentsContainer = document.getElementById("comments");
  commentsContainer.innerHTML = "";
  data.comments.forEach((comment) => {
    const commentElement = document.createElement("div");
    commentElement.classList.add("mb-3");
    commentElement.innerHTML = `
                      <div class="row comment-container">
                        <div class="col-md-12">
                          <div class="comment">
                            <div class="username">${comment.username}</div>
                            <div>${comment.content}</div>                        
                            <div class="timestamp">${comment.created_at}</div>
                          </div>
                        </div>
                      </div>
                    `;
    commentsContainer.appendChild(commentElement);
  });
  articleModal.show();
}

function loadArticles(category = null, offset = null) {
  const fetchCountUrl =
    category != null && category != "all"
      ? apiUrl + `index.php?page=articles&category=${category}&action=total`
      : apiUrl + "index.php?page=articles&action=total";
  fetch(fetchCountUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      totalArticles = data.total;
    })
    .catch((error) => {
      console.error("Error fetching total articles:", error);
    })
    .finally(() => {
      totalPages = Math.ceil(totalArticles / articlesPerPage);
      createPagination(totalPages);
      if (offset === null) {
        offset = 0;
      }
      const limit = articlesPerPage;
      let fetchUrl =
        category != null && category != "all"
          ? apiUrl +
            `index.php?page=articles&category=${category}&offset=${offset}&limit=${limit}`
          : apiUrl +
            "index.php?page=articles&offset=" +
            offset +
            "&limit=" +
            limit;
      const pageButtons = document.querySelectorAll(".page-button");
      const urlParams = new URLSearchParams(window.location.search);
      pageNumber = parseInt(urlParams.get("page")) || 1;
      if (!firstLoad && !window.location.hash) {
        updateUrlWithPage(pageNumber, category);
      }
      pageButtons.forEach((button) => {
        if (parseInt(button.getAttribute("data-page-number")) == pageNumber) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });
      fetch(fetchUrl)
        .then((response) => {
          return response.json();
        })
        .then((articles) => {
          articlesContainer.innerHTML = "";
          const maxLength = 255;
          if (articles.length > 0) {
            articles.forEach((article) => {
              if (article.content.length > maxLength) {
                article.content = article.content.substr(0, maxLength) + "...";
              }
              const articleDate = new Date(article.created_at);
              const formattedDate = formatDate(articleDate);
              const articleCard = `
                  <div class="col-md-4 mb-4">
                      <div class="card shadow" id="post-${article.id}">
                          <img src="${article.image_url}" class="card-img-top article-image" alt="${article.title}" loading="lazy">
                          <div class="card-body">
                              <h5 class="card-title">${article.title}</h5>
                              <p class="card-text">${article.short_content}</p>
                              <p class="card-text date">${formattedDate}</p>
                              <a class="btn btn-primary read-more pointer" data-article-id="${article.id}" href="#${article.slug}">Read More</a>
                          </div>
                      </div>
                  </div>
              `;
              articlesContainer.innerHTML += articleCard;
            });
            const readMoreButtons = document.querySelectorAll(".read-more");
            readMoreButtons.forEach((button) => {
              button.addEventListener("click", (event) => {
                event.preventDefault();
                const articleId = button.getAttribute("data-article-id");
                fetch(`${apiUrl}index.php?page=articles&id=${articleId}`)
                  .then((response) => {
                    return response.json();
                  })
                  .then((data) => {
                    loadArticle(data);
                  });
              });
            });
          } else {
            articlesContainer.innerHTML +=
              '<p class="text-center mt-3">Still not articles to load.</p>';
          }
        })
        .catch((error) => {
          console.error("Error fetching articles:", error);
        });
      const urlHash = window.location.hash.slice(1);
      if (urlHash) {
        fetchUrl = apiUrl + `index.php?page=articles&slug=${urlHash}`;
        fetch(fetchUrl)
          .then((response) => {
            if (response.status == 404) {
              window.location.hash = "";
              showPage(1, firstLoad);
              return;
            }
            return response.json();
          })
          .then((data) => {
            if (data) {
              loadArticle(data);
            }
          })
          .catch((error) => {
            console.error("Error fetching article by slug:", error);
          });
      }
    });
}

function loadCategories() {
  // Extract the URL search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = parseInt(urlParams.get("category"));

  fetch(apiUrl + "index.php?page=categories")
    .then((response) => {
      return response.json();
    })
    .then((categories) => {
      const categorySelect = document.getElementById("categorySelect");
      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = "All";
      categorySelect.appendChild(allOption);
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent =
          category.name.charAt(0).toUpperCase() + category.name.slice(1);

        // If the category matches the one in the URL, set it as selected
        if (categoryParam && category.id === categoryParam) {
          option.selected = true;
        }

        categorySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
    });
}

function showSuccessMessage(message) {
  const alert = document.createElement("div");
  alert.classList.add("alert", "alert-success");
  alert.setAttribute("role", "alert");
  alert.innerHTML = message;
  const container = document.getElementById("alert-container");
  container.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

document
  .getElementById("logoutConfirmButton")
  .addEventListener("click", function () {
    localStorage.clear();
    setDisplay();
    logoutModal.hide();
    showSuccessMessage("You have been successfully logged out.");
  });

passwordInput.addEventListener("input", function () {
  validatePassword(passwordInput);
});

function registerUser(username, email, password) {
  const formData = new FormData();
  formData.append("action", "register");
  formData.append("page", "users");
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);

  fetch(apiUrl + "index.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.status === 201) {
        return response.json();
      } else if (response.status === 409) {
        registrationError.textContent = "Email or username already taken";
        return Promise.reject(new Error("Email or username already taken"));
      } else {
        throw new Error(response.status);
      }
    })
    .then(() => {
      registrationError.textContent = "";
      registerModal.hide();
      loginModal.show();
    })
    .catch((error) => {
      console.error("Error registering user:", error);
    });
}

function login(email, password) {
  const formData = new FormData();
  formData.append("action", "login");
  formData.append("page", "users");
  formData.append("email", email);
  formData.append("password", password);

  fetch(apiUrl + "index.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 401) {
        loginError.textContent = "Bad credentials";
        return Promise.reject(new Error("Bad credentials"));
      } else {
        throw new Error(response.status);
      }
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      loginError.textContent = "";
      setDisplay();
      loginModal.hide();
      showSuccessMessage("You have been successfully logged in.");
    })
    .catch((error) => {
      console.error("Error registering user:", error);
    });
}

if (document.getElementById("registerForm")) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const username = document.getElementById("usernameSignup").value;
      const email = document.getElementById("emailSignup").value;
      const password = document.getElementById("passwordSignup").value;

      registerUser(username, email, password);
    });
}

if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    login(email, password);
  });
}

function updateUrlWithCategoryAndPage(category, page) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("page", page);
  if (category !== "all") {
    urlParams.set("category", category);
  } else {
    urlParams.delete("category");
  }
  window.history.pushState(
    null,
    "",
    window.location.pathname + "?" + urlParams.toString()
  );
}

function getCurrentPageFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get("page");
  return pageParam ? parseInt(pageParam) : 1;
}

if (document.getElementById("categorySelect")) {
  document
    .getElementById("categorySelect")
    .addEventListener("change", (event) => {
      selectedCategory = event.target.value;
      const currentPage = getCurrentPageFromUrl();
      updateUrlWithCategoryAndPage(selectedCategory, currentPage);
      showPage(1);
    });
}

if (document.getElementById("contactForm")) {
  document
    .getElementById("contactForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      let senderName = name.value;
      let senderMessage = message.value;
      let senderEmail = email.value;
      let senderBotControl = botControl.value;

      if (senderBotControl !== "") {
        alert("Go away spammer !");
        return;
      }
      if (senderName.trim() === "") {
        nameControl.textContent = "Please enter your name.";
        return;
      }
      if (senderEmail.trim() === "" || !emailRegex.test(senderEmail.trim())) {
        emailControl.textContent = "Please enter a valid email address.";
        return;
      }
      if (senderMessage.trim() === "") {
        messageControl.textContent = "Please enter your message.";
        return;
      }

      const formData = new FormData();
      formData.append("sender", senderName);
      formData.append("email", senderEmail);
      formData.append("message", senderMessage);
      formData.append("botcontrol", senderBotControl);
      formData.append("page", "email");

      const token = localStorage.getItem("token");
      if (token) {
        formData.append("token", token);
      } else {
        formData.append("token", "");
      }

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        if (response.status === 200) {
          name.value = "";
          email.value = "";
          message.value = "";
          emailMessageToast.show();
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
}

function setDisplay() {
  if (localStorage.getItem("token")) {
    document.getElementById("logoutButton").style.display = "inline-block";
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("signupButton").style.display = "none";
    commentTextarea.disabled = false;
    commentSubmit.disabled = false;
    commentTextarea.placeholder = "Leave a comment...";
  } else {
    document.getElementById("logoutButton").style.display = "none";
    document.getElementById("loginButton").style.display = "inline-block";
    document.getElementById("signupButton").style.display = "inline-block";
    commentTextarea.disabled = true;
    commentSubmit.disabled = true;
    commentTextarea.placeholder = "Please login to leave a comment.";
  }
}

function showSuccessNotification() {
  const successToast = new bootstrap.Toast(
    document.getElementById("successToast")
  );
  successToast.show();
}

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData();
  const token = localStorage.getItem("token");
  const comment = document.getElementById("comment").value;
  const articleId = document.getElementById("article-id").value;
  formData.append("token", token);
  formData.append("page", "comments");
  formData.append("content", comment);
  formData.append("article_id", articleId);
  if (comment == "" || articleId == "" || token == "") {
    return false;
  }
  fetch(apiUrl + "index.php", {
    method: "POST",
    body: formData,
  })
    .then(async (response) => {
      if (response.status === 400) {
        const resp = await response.json();
        if (resp.message == "moderation") {
          moderation.textContent =
            "Your comment has been flagged as offensive. Please revise your comment and try again.";
        }
        throw new Error("Moderation error");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("comment").value = "";
      moderation.textContent = "";
      articleModal.hide();
      showSuccessNotification();
    })
    .catch((error) => {
      console.error("Error posting comment:", error);
    });
});

loginModal._element.addEventListener("show.bs.modal", () => {
  loginError.textContent = "";
});

registerModal._element.addEventListener("show.bs.modal", () => {
  registrationError.textContent = "";
});

articleModal._element.addEventListener("show.bs.modal", () => {
  moderation.textContent = "";
});

articleModal._element.addEventListener("hide.bs.modal", () => {
  while (sources.firstChild) {
    sources.removeChild(sources.firstChild);
  }
  const currentUrl = new URL(window.location.href);
  currentUrl.hash = "";
  window.history.replaceState(null, "", currentUrl.toString());
});

setDisplay();
loadCategories();

const tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

showPage(parseInt(initialPage), firstLoad);
