"use strict";
(() => {
  const blocks = document.querySelectorAll("pre.astro-code");
  if (!blocks.length) return;

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn("Copy failed, falling back to legacy method", error);
      }
    }
    return fallbackCopy(text);
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    let success = false;
    try {
      success = document.execCommand("copy");
    } catch (error) {
      console.warn("Legacy copy failed", error);
    }
    document.body.removeChild(textarea);
    return success;
  };

  blocks.forEach((block) => {
    if (block.dataset.copyReady === "true") return;
    const code = block.querySelector("code");
    if (!code) return;
    const codeClass = code.getAttribute("class") || "";
    const codeLang = code.getAttribute("data-language") || "";
    const preLang = block.getAttribute("data-language") || "";
    if (
      codeClass.includes("language-mermaid") ||
      codeLang === "mermaid" ||
      preLang === "mermaid"
    ) {
      return;
    }
    block.dataset.copyReady = "true";

    const wrapper = document.createElement("div");
    wrapper.className = "code-block code-block--copy";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-block__copy";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.setAttribute("title", "Copy code");

    let resetTimer = null;
    button.addEventListener("click", async () => {
      const text = code.textContent || "";
      const copied = await copyText(text);
      if (!copied) return;

      button.dataset.copied = "true";
      button.textContent = "Copied";
      button.setAttribute("aria-label", "Copied");

      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      resetTimer = window.setTimeout(() => {
        button.dataset.copied = "false";
        button.textContent = "Copy";
        button.setAttribute("aria-label", "Copy code to clipboard");
      }, 2000);
    });

    const parent = block.parentNode;
    if (!parent) return;
    parent.insertBefore(wrapper, block);
    wrapper.appendChild(button);
    wrapper.appendChild(block);
  });
})();
