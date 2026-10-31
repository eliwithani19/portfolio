(() => {
    const gallery = document.querySelector("#exp .experience-gallery");
    if (!gallery) return;
    const deck = gallery.querySelector(".experience-deck");
    const cards = [...deck.querySelectorAll(":scope > .exp")];
    if (!cards.length) return;

    let pinned = false;
    let hovered = false;
    let hoverSuppressed = false;
    let lastWidth = 0;

    const isExpanded = () => pinned || (hovered && !hoverSuppressed);

    function layout() {
        const width = deck.clientWidth;
        if (!width) return;
        lastWidth = width;
        const expanded = isExpanded();
        const gap = 24;
        const columns = Math.min(Math.ceil(cards.length / 2), Math.max(1,
            Math.floor((width + gap) / (260 + gap))));
        const closedWidth = Math.min(360, Math.max(1, width - 48));
        const closedHeight = Math.round((closedWidth - 24) * 0.75) + 110;
        const cardWidth = expanded
            ? Math.min(400, (width - gap * (columns - 1)) / columns)
            : closedWidth;
        const photoHeight = Math.max(1, Math.round((cardWidth - 24) * 0.75));
        const cardHeight = photoHeight + 110;
        const rows = Math.ceil(cards.length / columns);
        const openHeight = 56 + rows * cardHeight + (rows - 1) * 28;
        // Keep the hover area stable as the stack spreads into larger rows.
        deck.style.setProperty("--deck-height",
            Math.max(closedHeight + 80, expanded ? openHeight : 0) + "px");

        cards.forEach((card, index) => {
            const row = Math.floor(index / columns);
            const column = index % columns;
            const rowCount = Math.min(columns, cards.length - row * columns);
            const rowWidth = rowCount * cardWidth + (rowCount - 1) * gap;
            const offset = index - (cards.length - 1) / 2;
            const x = expanded
                ? (width - rowWidth) / 2 + column * (cardWidth + gap)
                : (width - cardWidth) / 2 + offset * 7;
            const y = expanded
                ? 28 + row * (cardHeight + 28)
                : 28 + Math.abs(offset) * 6;
            const angle = expanded ? offset * 0.7 : offset * 4;

            Object.entries({
                "--card-width": cardWidth + "px",
                "--card-height": cardHeight + "px",
                "--photo-height": photoHeight + "px",
                "--card-x": x + "px",
                "--card-y": y + "px",
                "--card-angle": angle + "deg",
                "--card-z": String(expanded ? index + 1 : cards.length - index),
                "--deal-delay": (expanded ? index * 700 : (cards.length - index - 1) * 35) + "ms"
            }).forEach(([property, value]) => card.style.setProperty(property, value));
        });

        deck.classList.add("is-ready");
        deck.classList.toggle("is-open", expanded);
        deck.setAttribute("aria-expanded", String(expanded));
        deck.setAttribute("aria-label", expanded ? "Stack experience photos" : "Spread experience photos");
    }

    function togglePinned() {
        pinned = !pinned;
        hoverSuppressed = !pinned;
        layout();
    }

    deck.addEventListener("pointerenter", event => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        hovered = true;
        hoverSuppressed = false;
        layout();
    });
    deck.addEventListener("pointerleave", () => {
        hovered = false;
        hoverSuppressed = false;
        layout();
    });
    deck.addEventListener("click", togglePinned);
    gallery.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePinned();
            return;
        }
        if (event.key !== "Escape") return;
        pinned = false;
        hoverSuppressed = true;
        layout();
        deck.focus({ preventScroll: true });
    });

    if ("ResizeObserver" in window) {
        const observer = new window.ResizeObserver(() => {
            if (deck.clientWidth !== lastWidth) layout();
        });
        observer.observe(deck);
    } else {
        window.addEventListener("resize", () => {
            if (deck.clientWidth !== lastWidth) layout();
        });
    }
    layout();
})();
