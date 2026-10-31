const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
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

    // Leave content visible when motion is reduced or the API is unavailable.
    if (motionPreference.matches || !("IntersectionObserver" in window)) return;

    revealObserver = new IntersectionObserver(entries => {
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

const typingContent = [
    {
        selector: ".home-content .text",
        strings: ["Degree Holder", "Diabetic", "Gamer"],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 500
    },
    {
        selector: ".contact-text .text1",
        strings: ["You can visit my social media, contact me on email and contact number provided below. Rooting and Attracting Project together! Have a Great Day!"],
        typeSpeed: 10,
        backSpeed: 10,
        backDelay: 5000
    }
];
let typingInstances = [];

function setupTyping() {
    typingInstances.forEach(instance => instance.destroy());
    typingInstances = [];

    typingContent.forEach(({ selector, strings, ...options }) => {
        const element = document.querySelector(selector);
        if (!element) return;
        element.textContent = strings[0];
        if (!motionPreference.matches && typeof window.Typed === "function") {
            typingInstances.push(new window.Typed(element, {
                strings,
                ...options,
                loop: true
            }));
        }
    });
}

setupScrollReveal();
setupTyping();
motionPreference.addEventListener("change", () => {
    setupScrollReveal();
    setupTyping();
});
