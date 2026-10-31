const root = document.documentElement;
const header = document.querySelector(".header");
const navLinks = [...document.querySelectorAll(".navbar a[href^='#']")];
const sections = [...document.querySelectorAll("main > section[id]")];
const motionToggle = document.getElementById("motion-toggle");
let animationEnabled = true;
try {
    animationEnabled = localStorage.getItem("portfolio-motion") !== "off";
} catch {
    // The site still works when storage is blocked.
}

sections.forEach(section => section.setAttribute("tabindex", "-1"));

function createTypewriter(element, strings, options) {
    let wordIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer;
    let running = false;

    function tick() {
        if (!running) return;
        const word = strings[wordIndex];
        characterIndex += deleting ? -1 : 1;
        element.textContent = word.slice(0, characterIndex);
        let delay = deleting ? options.backSpeed : options.typeSpeed;

        if (!deleting && characterIndex === word.length) {
            deleting = true;
            delay = options.backDelay;
        } else if (deleting && characterIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % strings.length;
            delay = 250;
        }
        timer = window.setTimeout(tick, delay);
    }

    return {
        start() {
            if (running) return;
            running = true;
            element.classList.add("is-typing");
            tick();
        },
        stop() {
            running = false;
            window.clearTimeout(timer);
            element.classList.remove("is-typing");
        },
        reset() {
            this.stop();
            wordIndex = 0;
            characterIndex = 0;
            deleting = false;
            element.textContent = strings[0];
        }
    };
}

const typingContent = [
    {
        selector: ".home-content .text",
        scope: ".home-content",
        strings: ["Degree Holder", "Diabetic", "Gamer"],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 800
    },
    {
        selector: ".contact-text .text1",
        scope: ".contact-text",
        strings: ["You can visit my social media, contact me on email and contact number provided below. Rooting and Attracting Project together! Have a Great Day!"],
        typeSpeed: 25,
        backSpeed: 10,
        backDelay: 5000
    }
];

const typewriters = typingContent.flatMap(({ selector, scope, strings, ...options }) => {
    const element = document.querySelector(selector);
    const container = document.querySelector(scope);
    if (!element || !container) return [];
    const bounds = container.getBoundingClientRect();
    return [{
        scope: container,
        visible: bounds.bottom > 0 && bounds.top < window.innerHeight,
        controller: createTypewriter(element, strings, options)
    }];
});

function syncTypewriters() {
    typewriters.forEach(writer => {
        if (!animationEnabled) {
            writer.controller.reset();
        } else if (writer.visible && !document.hidden) {
            writer.controller.start();
        } else {
            writer.controller.stop();
        }
    });
}

if ("IntersectionObserver" in window) {
    const typingObserver = new window.IntersectionObserver(entries => {
        entries.forEach(entry => {
            typewriters.filter(writer => writer.scope === entry.target)
                .forEach(writer => { writer.visible = entry.isIntersecting; });
        });
        syncTypewriters();
    });
    typewriters.forEach(writer => typingObserver.observe(writer.scope));
} else {
    typewriters.forEach(writer => { writer.visible = true; });
}
document.addEventListener("visibilitychange", syncTypewriters);

const revealElements = document.querySelectorAll([
    ".home-content",
    ".about-img",
    ".about-text",
    ".sub-title",
    ".services-list > div",
    ".container1",
    ".main-text > h2",
    ".work-list > .work",
    ".exp-list > .exp",
    ".contact-text",
    ".contact-form",
    ".last-text"
].join(", "));
let revealObserver;

function setupScrollReveal() {
    if (revealObserver) revealObserver.disconnect();
    revealElements.forEach(element => {
        element.classList.remove("scroll-reveal", "is-visible");
        element.style.removeProperty("--reveal-offset");
    });
    if (!animationEnabled || !("IntersectionObserver" in window)) return;

    revealObserver = new window.IntersectionObserver(entries => {
        entries.forEach(entry => {
            // Move away from the viewport on exit to avoid edge flicker.
            if (!entry.isIntersecting) {
                entry.target.style.setProperty("--reveal-offset",
                    entry.boundingClientRect.bottom <= 0 ? "-24px" : "24px");
            }
            entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
    }, { threshold: 0 });

    revealElements.forEach(element => {
        element.classList.add("scroll-reveal");
        revealObserver.observe(element);
    });
}

function configureMotion() {
    root.dataset.motion = animationEnabled ? "full" : "reduced";
    if (motionToggle) {
        motionToggle.setAttribute("aria-pressed", String(animationEnabled));
        motionToggle.title = animationEnabled ? "Pause animations" : "Resume animations";
        motionToggle.querySelector("span").textContent = animationEnabled ? "Motion on" : "Motion off";
        motionToggle.querySelector("i").className = animationEnabled ? "bx bx-pause" : "bx bx-play";
    }
    setupScrollReveal();
    syncTypewriters();
}

motionToggle?.addEventListener("click", () => {
    animationEnabled = !animationEnabled;
    try {
        localStorage.setItem("portfolio-motion", animationEnabled ? "on" : "off");
    } catch {
        // Keep the current choice for this page even without persistent storage.
    }
    configureMotion();
});

let navUpdatePending = false;
function updateActiveLink() {
    navUpdatePending = false;
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const threshold = headerHeight + Math.max(0, window.innerHeight - headerHeight) * 0.2;
    let activeSection = sections[0];
    sections.forEach(section => {
        if (section.getBoundingClientRect().top <= threshold) activeSection = section;
    });

    navLinks.forEach(link => {
        const active = link.getAttribute("href") === "#" + activeSection?.id;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
    });
}

function scheduleNavUpdate() {
    if (navUpdatePending) return;
    navUpdatePending = true;
    window.requestAnimationFrame(updateActiveLink);
}

function updateHeaderHeight() {
    if (header) {
        root.style.setProperty("--header-height",
            Math.ceil(header.getBoundingClientRect().height) + "px");
    }
    scheduleNavUpdate();
}

if (header && "ResizeObserver" in window) {
    const headerObserver = new window.ResizeObserver(updateHeaderHeight);
    headerObserver.observe(header);
}
window.addEventListener("resize", updateHeaderHeight);
window.addEventListener("scroll", scheduleNavUpdate, { passive: true });
window.addEventListener("hashchange", scheduleNavUpdate);
window.addEventListener("load", () => {
    updateHeaderHeight();
    // Re-align direct links after the real header height and images are known.
    const target = sections.find(section => "#" + section.id === window.location.hash);
    target?.scrollIntoView({ behavior: "instant", block: "start" });
});

updateHeaderHeight();
configureMotion();
