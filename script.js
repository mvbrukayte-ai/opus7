// =========================================================
// AI-дайджест — логика поиска, фильтров и маленьких эффектов
// =========================================================

// 1. Находим нужные элементы на странице
const cards = Array.from(document.querySelectorAll(".card"));
const chips = Array.from(document.querySelectorAll(".chip"));
const searchInput = document.querySelector("#search");
const clearButton = document.querySelector("#clear-search");
const resetButtons = document.querySelectorAll("[data-reset]");
const counter = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const progressBar = document.querySelector("#scroll-progress");

let activeTag = "all";

// 2. Небольшие помощники

// Приводим текст к одному виду: нижний регистр, «ё» заменяем на «е».
function normalize(text) {
  return text.toLowerCase().replaceAll("ё", "е").trim();
}

// Главная функция: показывает только подходящие карточки.
function applyFilters() {
  const query = normalize(searchInput.value);
  let visibleCount = 0;

  cards.forEach((card) => {
    const cardTags = card.dataset.tags.split("|");
    const matchesTag = activeTag === "all" || cardTags.includes(activeTag);
    const matchesSearch = query === "" || normalize(card.dataset.search).includes(query);
    const isVisible = matchesTag && matchesSearch;

    card.classList.toggle("is-hidden", !isVisible);

    if (isVisible) {
      visibleCount += 1;
    }
  });

  counter.textContent = `Показано ${visibleCount} из ${cards.length}`;
  emptyState.hidden = visibleCount > 0;
  clearButton.hidden = searchInput.value.length === 0;

  const filtersAreActive = activeTag !== "all" || searchInput.value.trim() !== "";
  resetButtons.forEach((button) => {
    // Кнопка внутри пустого состояния должна быть видна всегда.
    if (!button.closest("#empty-state")) {
      button.hidden = !filtersAreActive;
    }
  });
}

// Сбрасываем и поиск, и выбранный тег.
function resetFilters() {
  activeTag = "all";
  searchInput.value = "";

  chips.forEach((chip) => {
    const isAllChip = chip.dataset.tag === "all";
    chip.classList.toggle("is-active", isAllChip);
    chip.setAttribute("aria-pressed", String(isAllChip));
  });

  applyFilters();
}

// 3. Поиск

searchInput.addEventListener("input", applyFilters);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchInput.value = "";
    applyFilters();
    searchInput.blur();
  }
});

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  applyFilters();
  searchInput.focus();
});

// Клавиша «/» быстро ставит курсор в поиск.
document.addEventListener("keydown", (event) => {
  const active = document.activeElement;
  const isTyping =
    active.tagName === "INPUT" ||
    active.tagName === "TEXTAREA" ||
    active.isContentEditable;

  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

// 4. Фильтр по тегам

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    activeTag = chip.dataset.tag;

    chips.forEach((item) => {
      const isActive = item === chip;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    applyFilters();
  });
});

// 5. Сброс фильтров (в панели и в пустом состоянии)

resetButtons.forEach((button) => {
  button.addEventListener("click", resetFilters);
});

// 6. Кнопки «Мне повезёт» открывают случайный материал

document.querySelectorAll("[data-random]").forEach((button) => {
  button.addEventListener("click", () => {
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const link = randomCard.querySelector(".card__link");

    if (link) {
      window.open(link.href, "_blank", "noopener,noreferrer");
    }
  });
});

// 7. Блик внутри карточки следует за курсором (только на компьютере)

const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canHover) {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();

      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

// 8. Полоска прогресса чтения вверху страницы

function updateProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

  progressBar.style.transform = `scaleX(${progress})`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

// 9. Первый запуск — показываем актуальные цифры
applyFilters();
updateProgress();
