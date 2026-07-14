"use strict";

/* =========================================================
   PAGE ELEMENTS
========================================================= */

const rootElement = document.documentElement;

const themeToggle = document.getElementById("themeToggle");
const paletteButton = document.getElementById("paletteButton");
const themePanel = document.getElementById("themePanel");
const colourButtons = document.querySelectorAll("[data-accent-option]");

const mobileMenuButton = document.getElementById("mobileMenuButton");
const navLinksContainer = document.getElementById("navLinks");
const navLinks = document.querySelectorAll(".nav-links a");

const pageSections = document.querySelectorAll("main section[id], main header[id]");
const revealElements = document.querySelectorAll(".reveal");
const projectCards = document.querySelectorAll("[data-project-card]");
const currentYearElement = document.getElementById("currentYear");

/* =========================================================
   THEME SETUP
========================================================= */

const savedTheme = localStorage.getItem("portfolio-theme");
const savedAccent = localStorage.getItem("portfolio-accent");
const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

function applyTheme(theme) {
    rootElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);

    const isLightTheme = theme === "light";

    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-label",
            isLightTheme ? "Switch to dark mode" : "Switch to light mode"
        );
    }
}

function applyAccent(accent) {
    rootElement.setAttribute("data-accent", accent);
    localStorage.setItem("portfolio-accent", accent);

    colourButtons.forEach((button) => {
        const isSelected = button.dataset.accentOption === accent;
        button.classList.toggle("selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
}

applyTheme(savedTheme || (systemPrefersLight ? "light" : "dark"));
applyAccent(savedAccent || "purple");

/* =========================================================
   LIGHT / DARK MODE BUTTON
========================================================= */

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const currentTheme = rootElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
    });
}

/* =========================================================
   ACCENT COLOUR MENU
========================================================= */

function closeThemePanel() {
    if (!themePanel || !paletteButton) {
        return;
    }

    themePanel.classList.remove("open");
    paletteButton.setAttribute("aria-expanded", "false");
}

function openThemePanel() {
    if (!themePanel || !paletteButton) {
        return;
    }

    themePanel.classList.add("open");
    paletteButton.setAttribute("aria-expanded", "true");
}

if (paletteButton) {
    paletteButton.addEventListener("click", (event) => {
        event.stopPropagation();

        const isOpen = themePanel.classList.contains("open");

        if (isOpen) {
            closeThemePanel();
        } else {
            openThemePanel();
        }
    });
}

colourButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedAccent = button.dataset.accentOption;
        applyAccent(selectedAccent);
        closeThemePanel();
    });
});

document.addEventListener("click", (event) => {
    const clickedInsideThemeSelector = event.target.closest(".theme-selector");

    if (!clickedInsideThemeSelector) {
        closeThemePanel();
    }
});

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function closeMobileMenu() {
    if (!navLinksContainer || !mobileMenuButton) {
        return;
    }

    navLinksContainer.classList.remove("open");
    mobileMenuButton.classList.remove("open");
    mobileMenuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
}

function openMobileMenu() {
    if (!navLinksContainer || !mobileMenuButton) {
        return;
    }

    navLinksContainer.classList.add("open");
    mobileMenuButton.classList.add("open");
    mobileMenuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
}

if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
        const isOpen = navLinksContainer.classList.contains("open");

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeMobileMenu();
    });
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
});

/* =========================================================
   ACTIVE NAVIGATION LINK
========================================================= */

const activeSectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const sectionId = entry.target.id;

            navLinks.forEach((link) => {
                const linkTarget = link.getAttribute("href");

                link.classList.toggle(
                    "active",
                    linkTarget === `#${sectionId}`
                );
            });
        });
    },
    {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
    }
);

pageSections.forEach((section) => {
    activeSectionObserver.observe(section);
});

/* =========================================================
   SCROLL REVEAL ANIMATIONS
========================================================= */

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        });
    },
    {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    }
);

revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(element);
});

/* =========================================================
   PROJECT EXPAND / COLLAPSE
========================================================= */

projectCards.forEach((card) => {
    const summaryButton = card.querySelector(".project-summary");
    const arrow = card.querySelector(".project-arrow");

    if (!summaryButton) {
        return;
    }

    summaryButton.addEventListener("click", () => {
        const isExpanded = card.classList.contains("expanded");

        card.classList.toggle("expanded", !isExpanded);
        summaryButton.setAttribute("aria-expanded", String(!isExpanded));

        if (arrow) {
            arrow.textContent = isExpanded ? "⌄" : "⌃";
        }
    });
});


/* =========================================================
   PROJECT SCREENSHOT GALLERIES
========================================================= */

const galleryButtons = document.querySelectorAll("[data-gallery-image]");

galleryButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        event.stopPropagation();

        const gallery = button.closest("[data-project-gallery]");

        if (!gallery) {
            return;
        }

        const mainImage = gallery.querySelector(".main-project-image");
        const caption = gallery.querySelector(".main-project-caption");
        const thumbnailImage = button.querySelector("img");
        const nextImage = button.dataset.galleryImage;
        const nextCaption = button.dataset.galleryCaption || "";

        if (mainImage && nextImage) {
            mainImage.src = nextImage;

            if (thumbnailImage) {
                mainImage.alt = thumbnailImage.alt;
            }
        }

        if (caption) {
            caption.textContent = nextCaption;
        }

        gallery.querySelectorAll("[data-gallery-image]").forEach((item) => {
            item.classList.toggle("active", item === button);
        });
    });
});

/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeThemePanel();
        closeMobileMenu();
    }
});

/* =========================================================
   CURRENT YEAR
========================================================= */

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}
