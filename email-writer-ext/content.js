// content.js
console.log("Extension loaded");

// -----------------------------
// UI BUTTON CREATION
// -----------------------------
function createAIButton(text, tooltip, className) {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 " + (className || "");
  button.style.marginRight = "8px";
  button.innerText = text;
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", tooltip || "");
  button.style.cursor = "pointer";
  return button;
}

// -----------------------------
// FIND TOOLBAR
// -----------------------------
function findComposeToolbar() {
  const selectors = [
    ".btC", // Gmail toolbar class (varies)
    ".aDh", // another common Gmail toolbar class
    '[role="toolbar"]',
    ".gU.Up",
  ];

  for (const selector of selectors) {
    const toolBar = document.querySelector(selector);
    if (toolBar) return toolBar;
  }

  return null;
}

// -----------------------------
// GET EMAIL CONTENT
// -----------------------------
function getEmailContent() {
  const selectors = [
    ".h7", // quoted text container (varies)
    ".a3s.aiL", // Gmail message content
    ".gmail_quote",
    '[role="presentation"]',
  ];

  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content && content.innerText) {
      return content.innerText.trim();
    }
  }

  return "";
}

// -----------------------------
// FIND COMPOSE BOX
// -----------------------------
function findComposeBox() {
  // Gmail compose area may be a contenteditable div with role="textbox"
  // try several selectors
  const selectors = [
    '[role="textbox"][contenteditable="true"]',
    'div[aria-label="Message Body"]',
    '.editable[contenteditable="true"]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }

  return null;
}

// -----------------------------
// SEND INPUT EVENTS (refresh Gmail UI)
// -----------------------------
function dispatchInputEvents(target) {
  if (!target) return;
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "a" }));
}

// -----------------------------
// CALL BACKEND
// -----------------------------
async function callBackend(endpoint, payload) {
  const url = `http://localhost:8080${endpoint}`; // endpoints passed like '/api/email/generate'

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`API Error ${resp.status}: ${text}`);
    }

    // assume plain text reply
    const text = await resp.text();
    return text;
  } catch (err) {
    console.error("callBackend error:", err);
    throw err;
  }
}

// -----------------------------
// INSERT TEXT INTO COMPOSE BOX
// -----------------------------
// NOTE: avoid double-inserts: do NOT both set innerText and call execCommand.
// Use a single reliable insertion strategy (Range if selection exists, otherwise append).
function insertTextIntoComposeBox(text) {
  const composeBox = findComposeBox();
  if (!composeBox) {
    console.error("Compose box not found");
    return false;
  }

  composeBox.focus();

  // If it's a contenteditable element, prefer Range/selection insertion
  if (composeBox.isContentEditable) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      // Move caret after inserted node
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      dispatchInputEvents(composeBox);
      return true;
    }

    // Fallback: append to end (single insertion)
    composeBox.innerText = (composeBox.innerText || "") + text;
    dispatchInputEvents(composeBox);
    return true;
  }

  // Non-contenteditable (textarea/input) fallback
  try {
    if (typeof composeBox.selectionStart === "number") {
      const start = composeBox.selectionStart;
      const end = composeBox.selectionEnd;
      const value = composeBox.value || "";
      composeBox.value = value.slice(0, start) + text + value.slice(end);
      const newPos = start + text.length;
      composeBox.selectionStart = composeBox.selectionEnd = newPos;
      dispatchInputEvents(composeBox);
      return true;
    }

    // final fallback: set value
    composeBox.value = text;
    dispatchInputEvents(composeBox);
    return true;
  } catch (e) {
    console.error("Failed to insert text in compose box:", e);
    return false;
  }
}

// -----------------------------
// INJECT BUTTONS (idempotent-ish)
// -----------------------------
function injectButtons() {
  // Remove global old buttons to avoid leftovers during dev reloads
  const existingReply = document.querySelector(".ai-reply-button");
  if (existingReply) existingReply.remove();
  const existingSumm = document.querySelector(".ai-summarize-button");
  if (existingSumm) existingSumm.remove();

  const toolBar = findComposeToolbar();
  if (!toolBar) {
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found, injecting AI buttons");

  const replyBtn = createAIButton("AI Reply", "Generate AI reply", "ai-reply-button");
  const sumBtn = createAIButton("Summarize", "Summarize the email", "ai-summarize-button");

  // shared helper to handle UI during async call
  const withButtonLock = (button, fn) =>
    async (...args) => {
      const originalText = button.innerText;
      button.innerText = originalText + "…";
      button.style.pointerEvents = "none";
      try {
        await fn(...args);
      } catch (err) {
        console.error(err);
        alert("Operation failed: " + (err.message || "unknown error"));
      } finally {
        button.innerText = originalText;
        button.style.pointerEvents = "";
        // ensure labels are correct
        if (button.classList.contains("ai-reply-button")) button.innerText = "AI Reply";
        if (button.classList.contains("ai-summarize-button")) button.innerText = "Summarize";
      }
    };

  replyBtn.addEventListener("click", withButtonLock(replyBtn, async () => {
    const emailContent = getEmailContent();
    if (!emailContent) {
      alert("Could not find email content to generate a reply for.");
      return;
    }

    const payload = { emailContent, tone: "professional" };
    const generated = await callBackend("/api/email/generate", payload);

    if (generated) {
      insertTextIntoComposeBox(generated);
    } else {
      throw new Error("Empty response from generate endpoint");
    }
  }));

  sumBtn.addEventListener("click", withButtonLock(sumBtn, async () => {
    const emailContent = getEmailContent();
    if (!emailContent) {
      alert("Could not find email content to summarize.");
      return;
    }

    const payload = { emailContent, summaryLength: "short" };
    const summary = await callBackend("/api/email/summarize", payload);

    if (summary) {
      // Insert the summary into the compose box; we choose to prepend "Summary:" so user sees it
      const inserted = `Summary:\n\n${summary}\n\n---\n\n`;

      const composeBox = findComposeBox();
      if (composeBox && composeBox.isContentEditable) {
        const existing = composeBox.innerText || "";
        composeBox.innerText = inserted + existing;
        dispatchInputEvents(composeBox);
      } else {
        insertTextIntoComposeBox(inserted);
      }
    } else {
      throw new Error("Empty response from summarize endpoint");
    }
  }));

  // Insert the summarize button next to the reply button (reply first then summarize)
  // Use insertBefore so we place them consistently
  toolBar.insertBefore(replyBtn, toolBar.firstChild);
  toolBar.insertBefore(sumBtn, toolBar.firstChild);
}

// -----------------------------
// OBSERVER FOR COMPOSE WINDOW
// -----------------------------
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes || []);

    const hasComposeElements = addedNodes.some((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      if (node.matches && (node.matches(".aDh") || node.matches(".btC") || node.matches("[role='dialog']"))) return true;
      if (node.querySelector && (node.querySelector(".aDh") || node.querySelector(".btC") || node.querySelector("[role='dialog']"))) return true;
      return false;
    });

    if (hasComposeElements) {
      console.log("Compose Window Detected");
      // Small delay so Gmail finishes rendering compose toolbar
      setTimeout(injectButtons, 500);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Also try to inject immediately in case compose is already open
setTimeout(injectButtons, 1200);
