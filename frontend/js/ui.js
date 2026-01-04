// Global UI helpers: Image lightbox
(function() {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">Close ✕</button>
    <div class="lightbox-content"><img alt="Expanded image"></div>
  `;
  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(overlay);
    const imgEl = overlay.querySelector("img");
    const closeBtn = overlay.querySelector(".lightbox-close");

    const open = (src) => {
      imgEl.src = src;
      overlay.classList.add("open");
    };
    const close = () => {
      overlay.classList.remove("open");
      imgEl.src = "";
    };

    // Click on post images to open
    document.body.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.tagName === "IMG" && target.closest(".post-images")) {
        const src = target.getAttribute("src");
        if (src) open(src);
      }
    });

    overlay.addEventListener("click", (e) => {
      // close when clicking outside image
      if (!e.target.closest(".lightbox-content")) close();
    });
    closeBtn.addEventListener("click", close);
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  });
})();


// Register Service Worker (shared across pages)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(err => console.warn("SW registration failed:", err));
  });
}
