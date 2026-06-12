document.body.classList.add("page-loaded");

const revealItems = document.querySelectorAll(".reveal");

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${Math.min(index * 55, 220)}ms`);
  [...item.children].forEach((child, childIndex) => {
    child.style.setProperty("--item-delay", `${Math.min(childIndex * 95, 380)}ms`);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

const heroGrain = document.querySelector(".hero-grain");
let ticking = false;

const updateHeroParallax = () => {
  if (!heroGrain) return;
  const shift = Math.min(window.scrollY * 0.06, 28);
  heroGrain.style.setProperty("--hero-shift", `${shift}px`);
  ticking = false;
};

window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateHeroParallax);
}, { passive: true });

const rippleButtons = document.querySelectorAll(".primary-button, .contact-order, .submit-review");

rippleButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();

    ripple.className = "button-ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
});

const productFilterButtons = document.querySelectorAll(".product-filters .filter-btn");
const productCards = document.querySelectorAll(".product-grid .product-card");

const showProducts = () => {
  productCards.forEach((product, index) => {
    product.classList.remove("show");
    window.setTimeout(() => {
      product.classList.add("show");
    }, index * 200);
  });
};

productFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    productFilterButtons.forEach((filterButton) => {
      filterButton.classList.toggle("active", filterButton === button);
    });
    showProducts();
  });
});

showProducts();

const reviewSeed = [
  {
    name: "Local customer, Pookkad",
    rating: 5,
    text: "Clean aroma and genuine taste. It feels like the coconut oil we grew up with.",
    date: "2026-06-01T09:30:00.000Z"
  },
  {
    name: "Family kitchen, Kozhikode",
    rating: 5,
    text: "Fresh oil, neatly packed, and very reliable for daily cooking.",
    date: "2026-05-26T10:00:00.000Z"
  },
  {
    name: "Regular customer",
    rating: 4,
    text: "Simple, honest quality. We order regularly because the purity is consistent.",
    date: "2026-05-18T14:20:00.000Z"
  }
];

const storageKey = "kerasreeReviews";
const reviewForm = document.querySelector("#reviewForm");
const reviewList = document.querySelector("#reviewList");
const averageRating = document.querySelector("#averageRating");
const averageStars = document.querySelector("#averageStars");
const totalReviews = document.querySelector("#totalReviews");
const ratingButtons = [...document.querySelectorAll("#ratingInput button")];
const filterButtons = [...document.querySelectorAll("#reviewFilters button")];
let selectedRating = 5;
let activeFilter = "all";

const getReviews = () => {
  const savedReviews = localStorage.getItem(storageKey);
  if (!savedReviews) {
    localStorage.setItem(storageKey, JSON.stringify(reviewSeed));
    return reviewSeed;
  }

  try {
    return JSON.parse(savedReviews);
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(reviewSeed));
    return reviewSeed;
  }
};

const saveReviews = (reviews) => {
  localStorage.setItem(storageKey, JSON.stringify(reviews));
};

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);

const formatDate = (dateValue) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));

const starMarkup = (rating) => {
  const fullStars = "★".repeat(Math.round(rating));
  const emptyStars = "☆".repeat(5 - Math.round(rating));
  return `<span class="stars" aria-label="${rating} out of 5 stars">${fullStars}${emptyStars}</span>`;
};

const updateRatingInput = (previewRating = selectedRating) => {
  ratingButtons.forEach((button) => {
    const rating = Number(button.dataset.rating);
    button.classList.toggle("is-active", rating <= selectedRating);
    button.classList.toggle("is-preview", rating <= previewRating);
    button.setAttribute("aria-checked", String(rating === selectedRating));
  });
};

const renderReviews = () => {
  const reviews = getReviews().sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredReviews = activeFilter === "all"
    ? reviews
    : reviews.filter((review) => review.rating === Number(activeFilter));
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  averageRating.textContent = average.toFixed(1);
  averageStars.style.setProperty("--rating", average.toFixed(1));
  totalReviews.textContent = reviews.length;

  if (!filteredReviews.length) {
    reviewList.innerHTML = '<p class="empty-reviews">No reviews match this rating yet.</p>';
    return;
  }

  reviewList.innerHTML = filteredReviews.map((review, index) => `
    <blockquote class="review-card" style="--card-delay: ${Math.min(index * 80, 320)}ms">
      ${starMarkup(review.rating)}
      <p>"${escapeHtml(review.text)}"</p>
      <div class="review-meta">
        <cite>${escapeHtml(review.name)}</cite>
        <span class="review-date">${formatDate(review.date)}</span>
      </div>
    </blockquote>
  `).join("");
};

ratingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedRating = Number(button.dataset.rating);
    updateRatingInput();
  });

  button.addEventListener("mouseenter", () => {
    updateRatingInput(Number(button.dataset.rating));
  });
});

document.querySelector("#ratingInput")?.addEventListener("mouseleave", () => {
  updateRatingInput();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle("active", filterButton === button);
    });
    renderReviews();
  });
});

reviewForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#reviewName").value.trim();
  const text = document.querySelector("#reviewText").value.trim();

  if (!name || !text) return;

  const reviews = getReviews();
  reviews.push({
    name,
    rating: selectedRating,
    text,
    date: new Date().toISOString()
  });

  saveReviews(reviews);
  reviewForm.reset();
  selectedRating = 5;
  activeFilter = "all";
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });
  updateRatingInput();
  renderReviews();
});

updateRatingInput();
renderReviews();
