// CONTROLLER GLOBAL
let isAnimating = false;

// LOADING SCREEN - FECHAMENTO DIRETO E SEGURO
function fecharLoading() {
    const loader = document.getElementById("loading-screen");
    if (loader) {
        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";
        setTimeout(() => {
            loader.style.display = "none";
        }, 600);
    }
}

function iniciarLoading() {
    const loadingBarFill = document.querySelector(".loading-bar-fill");
    const loadingSubtitle = document.querySelector(".loading-subtitle");
    const loadingPercent = document.querySelector(".loading-percent");
    const loadingTip = document.querySelector(".loading-tip");
    const dancingText = document.querySelector(".dancing-text");
    const loadingImpact = document.querySelector(".loading-impact");
    if (!loadingBarFill) return;

    const duration = 1800;
    const startedAt = performance.now();
    const tips = [
        "Scanning route...",
        "Syncing persona profile...",
        "Building command interface...",
        "Calibrating battle HUD...",
        "Finalizing phantom link..."
    ];

    function atualizarFrame(now) {
        const progress = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
        loadingBarFill.style.width = progress + "%";
        if (loadingPercent) loadingPercent.textContent = progress + "%";

        if (loadingTip) {
            const tipIndex = Math.min(tips.length - 1, Math.floor(progress / 20));
            loadingTip.textContent = tips[tipIndex];
        }

        if (dancingText) {
            if (progress >= 82 && progress < 100) {
                dancingText.classList.add("glitch");
            } else {
                dancingText.classList.remove("glitch");
            }
        }

        if (progress < 100) {
            requestAnimationFrame(atualizarFrame);
        } else if (loadingSubtitle) {
            loadingSubtitle.textContent = "CONFIDANT SYSTEM READY";
            if (loadingImpact) {
                loadingImpact.classList.remove("active");
                // restart animation reliably
                void loadingImpact.offsetWidth;
                loadingImpact.classList.add("active");
            }
        }
    }

    requestAnimationFrame(atualizarFrame);
}

const root = document.documentElement;
let pointerFrame = null;
let latestPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

document.addEventListener("pointermove", (event) => {
    latestPointer.x = event.clientX;
    latestPointer.y = event.clientY;

    if (pointerFrame !== null) return;

    pointerFrame = requestAnimationFrame(() => {
        const xOffset = Math.round((latestPointer.x - window.innerWidth / 2) / 24);
        const yOffset = Math.round((latestPointer.y - window.innerHeight / 2) / 24);
        root.style.setProperty("--mx", String(xOffset));
        root.style.setProperty("--my", String(yOffset));
        pointerFrame = null;
    });
});

// Ensures the sequence runs either by time or on load
window.addEventListener("load", () => {
    iniciarLoading();
    setTimeout(fecharLoading, 2200);
});
setTimeout(fecharLoading, 3500);

// MENU NAVIGATION
const menuButtons = document.querySelectorAll(".menu-btn");
const slashTransition = document.getElementById("slash-transition");

menuButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        if (isAnimating) return;

        const targetId = button.getAttribute("href");
        const targetSection = document.getElementById(targetId ? targetId.substring(1) : "");

        if (targetSection && slashTransition) {
            isAnimating = true;
            slashTransition.classList.add("active");

            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 250);

            setTimeout(() => {
                slashTransition.classList.remove("active");
                isAnimating = false;
            }, 600);
        }
    });
});

// INTERSECTION OBSERVER FOR SECTIONS
const sections = document.querySelectorAll(".page");
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            if (entry.target.id === "skills") {
                const fills = entry.target.querySelectorAll(".fill");
                fills.forEach(fill => {
                    const level = fill.getAttribute("data-level") || "0";
                    fill.style.width = level + "%";
                    const valueLabel = fill.parentElement ? fill.parentElement.querySelector(".skill-value") : null;
                    if (valueLabel) {
                        valueLabel.textContent = level + "%";
                    }
                });
            }
            sectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

sections.forEach(s => sectionObserver.observe(s));

// RETURN BUTTONS
const returnButtons = document.querySelectorAll(".return-button");
returnButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (isAnimating) return;
        if (slashTransition) {
            isAnimating = true;
            slashTransition.classList.add("active");
            setTimeout(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, 250);
            setTimeout(() => { slashTransition.classList.remove("active"); isAnimating = false; }, 600);
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
});

const personaCard = document.querySelector(".persona-card");
const personaModal = document.getElementById("persona-modal");
const personaModalClose = document.querySelector(".persona-modal-close");
const personaModalBackdrop = document.querySelector(".persona-modal-backdrop");

function abrirPersonaModal() {
    if (!personaModal) return;
    personaModal.classList.add("active");
    personaModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function fecharPersonaModal() {
    if (!personaModal) return;
    personaModal.classList.remove("active");
    personaModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

if (personaCard) {
    personaCard.addEventListener("click", abrirPersonaModal);
    personaCard.addEventListener("keypress", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            abrirPersonaModal();
        }
    });
}

if (personaModalClose) {
    personaModalClose.addEventListener("click", fecharPersonaModal);
}

if (personaModalBackdrop) {
    personaModalBackdrop.addEventListener("click", fecharPersonaModal);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        fecharPersonaModal();
    }
});

const sectionButtons = new Map(Array.from(menuButtons).map(button => [button.getAttribute("href"), button]));
const highlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const button = sectionButtons.get(`#${entry.target.id}`);
        if (!button) return;
        if (entry.isIntersecting) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}, { threshold: 0.4 });

sections.forEach(section => highlightObserver.observe(section));

function createParticles(quantity = 22) {
    const particleContainer = document.getElementById("particles-container");
    if (!particleContainer) return;

    const randomBetween = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < quantity; i++) {
        const particle = document.createElement("span");
        particle.className = "particle";
        const size = randomBetween(4, 18);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${randomBetween(0, 100)}%`;
        particle.style.top = `${randomBetween(0, 100)}%`;
        particle.style.setProperty("--p-speed", `${randomBetween(4, 12)}s`);
        particle.style.opacity = `${randomBetween(0.12, 0.38)}`;
        particleContainer.appendChild(particle);
    }
}

createParticles();