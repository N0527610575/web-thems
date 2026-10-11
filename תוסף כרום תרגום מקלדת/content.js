// ==============================================================================
// מתרגם מקלדת חכם - Smart Keyboard Translator
// גרסה v2.2.0 (משוכתבת ומשודרגת: סינון מילים חכם, בועת זכוכית שקופה, תמיכה ב-Tab)
// ==============================================================================

console.log("🌐 [Keyboard Translator] v2.2.0 Loaded & Active! (Glass Bubble + Smart Vocabulary + Tab Key)");

// ==============================================================================
// 1. מפות תרגום דו-כיווניות מדויקות (מקלדת ישראלית תקנית)
// ==============================================================================
const engToHebMap = {
  'q': '/', 'w': '\'', 'e': 'ק', 'r': 'ר', 't': 'א', 'y': 'ט', 'u': 'ו', 'i': 'ן', 'o': 'ם', 'p': 'פ',
  'a': 'ש', 's': 'ד', 'd': 'ג', 'f': 'כ', 'g': 'ע', 'h': 'י', 'j': 'ח', 'k': 'ל', 'l': 'ך', ';': 'ף', '\'': ',',
  'z': 'ז', 'x': 'ס', 'c': 'ב', 'v': 'ה', 'b': 'נ', 'n': 'מ', 'm': 'צ', ',': 'ת', '.': 'ץ', '/': '.'
};

// מיפוי ייעודי מעברית לאנגלית כדי למנוע קונפליקטים בפיסוק
const hebToEngMap = {
  '/': 'q', '\'': 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p',
  'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l', 'ף': ';',
  ',': '\'', 'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm', 'ת': ',', 'ץ': '.',
  '.': '/'
};

function translateText(text) {
  if (!text) return "";
  let res = "";
  for (let char of text) {
    const lower = char.toLowerCase();
    if (engToHebMap[lower]) {
      res += engToHebMap[lower];
    } else if (hebToEngMap[char]) {
      res += hebToEngMap[char];
    } else {
      res += char;
    }
  }
  return res;
}

// ==============================================================================
// 2. מילון מילים תקינות למניעת False Positives (בדיקה חכמה ללא שגיאות שווא)
// ==============================================================================
const COMMON_ENGLISH_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he',
  'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
  'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
  'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
  'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has', 'had', 'car', 'cat', 'dog', 'hello',
  'test', 'email', 'google', 'facebook', 'login', 'web', 'app', 'code', 'link', 'page', 'site', 'user',
  'data', 'text', 'file', 'view', 'show', 'find', 'type', 'name', 'path', 'icon', 'true', 'false', 'null',
  'const', 'let', 'var', 'if', 'else', 'function', 'return', 'async', 'await', 'class', 'import', 'export',
  'from', 'default', 'style', 'width', 'height', 'color', 'border', 'padding', 'margin', 'font', 'help',
  'send', 'save', 'open', 'close', 'edit', 'delete', 'update', 'post', 'get', 'put', 'patch', 'api', 'key',
  'url', 'id', 'item', 'list', 'card', 'box', 'btn', 'image', 'video', 'audio', 'audio', 'sound', 'chat',
  'message', 'room', 'home', 'about', 'contact', 'search', 'filter', 'sort', 'order', 'cart', 'buy', 'shop',
  'price', 'free', 'pro', 'menu', 'nav', 'header', 'footer', 'main', 'side', 'bar', 'tab', 'tag', 'info',
  'read', 'write', 'log', 'error', 'warn', 'debug', 'start', 'stop', 'play', 'pause', 'next', 'prev', 'done'
]);

const FINAL_LETTERS = 'ךםןףץ';

function isEnglishLayoutWord(word) {
  return /^[A-Za-z,.\/;']+$/.test(word);
}

function isHebrewWord(word) {
  return /^[\u05D0-\u05EA]+$/.test(word);
}

function hasMisplacedFinalLetter(word) {
  if (!isHebrewWord(word) || word.length < 2) return false;
  for (let i = 0; i < word.length - 1; i++) {
    if (FINAL_LETTERS.includes(word[i])) return true;
  }
  return false;
}

// היסטוריית מילים שכבר טופלו או נדחו למניעת חזרתיות מטרידה
const processedWordsHistory = new Set();

function isSuspiciousWord(word) {
  if (!word || word.length < 2) return false;
  const lower = word.toLowerCase();

  // אם המילה כבר בהיסטוריה שטופלה
  if (processedWordsHistory.has(lower)) return false;

  // חסימת False Positives: אם זו מילה לגיטימית באנגלית, אל תציע לשנות אותה!
  if (COMMON_ENGLISH_WORDS.has(lower)) {
    return false;
  }

  // בדיקת פריסה אנגלית
  if (isEnglishLayoutWord(word)) {
    const translated = translateText(word);
    // מוודא שהתרגום מייצר מילה חוקית בעברית ללא אותיות סופיות באמצע
    return isHebrewWord(translated) && !hasMisplacedFinalLetter(translated);
  }

  // בדיקת עברית שגויה עם אותיות סופיות באמצע
  return hasMisplacedFinalLetter(word);
}

// ==============================================================================
// 3. משתני ניהול ממשק ומצב
// ==============================================================================
let activeField = null;
let floatingBtn = null;
let glassBubble = null;
let currentSuggestion = null;
let currentTargetWord = null;
let showTimer = null;
let isDismissedForDomain = false;

const DISMISS_KEY = `kb_translator_dismissed_${location.hostname}`;

if (chrome?.storage?.local) {
  chrome.storage.local.get([DISMISS_KEY], (res) => {
    isDismissedForDomain = !!res?.[DISMISS_KEY];
  });
}

function getRootInput(el) {
  if (!el) return null;
  const element = el instanceof HTMLElement ? el : el.parentElement;
  if (!element) return null;
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') return element;
  const editable = element.closest('[contenteditable="true"]');
  return editable || (element.isContentEditable ? element : null);
}

function getFieldText(el) {
  if (!el) return "";
  return (el.isContentEditable || el.getAttribute('contenteditable') === 'true') ? (el.innerText || "") : (el.value || "");
}

function setFieldText(el, text) {
  if (!el) return;
  if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
    el.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('insertText', false, text || "");
  } else {
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, text || "");
    else el.value = text || "";
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function getSelectionInfo(el) {
  if (!el) return null;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    try {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      if (start != null && end != null && end > start) {
        return { kind: 'input', text: el.value.substring(start, end), start, end };
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  const sel = window.getSelection();
  if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (el.contains(range.commonAncestorContainer) || range.commonAncestorContainer === el) {
      const text = sel.toString();
      if (text) return { kind: 'contenteditable', text, rect: range.getBoundingClientRect() };
    }
  }
  return null;
}

function replaceSelectionText(el, newText) {
  if (!el) return;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    const newVal = val.slice(0, start) + (newText || "") + val.slice(end);

    if (setter) setter.call(el, newVal);
    else el.value = newVal;

    el.focus();
    el.selectionStart = start;
    el.selectionEnd = start + (newText || "").length;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    el.focus();
    document.execCommand('insertText', false, newText || "");
  }
}

// החלפת המילה האחרונה בשדה (הטמעת התיקון)
function replaceLastWordInField(el, originalWord, correctedWord) {
  if (!el) return;

  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const val = el.value;
    const cursorPos = el.selectionEnd ?? val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastWordIndex = textBeforeCursor.lastIndexOf(originalWord);

    if (lastWordIndex !== -1) {
      const newVal = val.slice(0, lastWordIndex) + correctedWord + val.slice(lastWordIndex + originalWord.length);
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(el, newVal);
      else el.value = newVal;

      const newCursor = lastWordIndex + correctedWord.length;
      el.focus();
      el.setSelectionRange(newCursor, newCursor);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
    // בעורך עשיר, מחליפים את המילה האחרונה
    const text = el.innerText || "";
    const lastWordIndex = text.lastIndexOf(originalWord);
    if (lastWordIndex !== -1) {
      const newText = text.slice(0, lastWordIndex) + correctedWord + text.slice(lastWordIndex + originalWord.length);
      setFieldText(el, newText);
    }
  }
}

// ==============================================================================
// 4. בועת זכוכית שקופה (Transparent Glass Bubble) - מימוש מלא ויוקרתי
// ==============================================================================
function ensureGlassBubbleCreated() {
  if (glassBubble) return;

  glassBubble = document.createElement("div");
  glassBubble.id = "kb-translator-glass-bubble";
  
  Object.assign(glassBubble.style, {
    position: "absolute",
    zIndex: "2147483647",
    padding: "6px 12px",
    background: "rgba(15, 23, 42, 0.90)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(59, 130, 246, 0.45)",
    borderRadius: "10px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.45), 0 0 15px rgba(59, 130, 246, 0.25)",
    color: "#f8fafc",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    direction: "rtl",
    pointerEvents: "auto",
    opacity: "0",
    transform: "translateY(5px) scale(0.95)",
    transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    userSelect: "none"
  });

  glassBubble.innerHTML = `
    <span style="display:inline-flex; align-items:center; gap:4px; font-weight:600; color:#60a5fa;">
      🌐 <span id="kb-suggest-word" style="color:#ffffff; font-family:monospace; font-size:13px;"></span>
    </span>
    <span style="background:rgba(59, 130, 246, 0.2); border:1px solid rgba(96, 165, 250, 0.4); color:#93c5fd; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:bold; cursor:pointer;" id="kb-tab-badge">
      מקש Tab ↹
    </span>
    <button id="kb-accept-btn" style="background:#2563eb; color:#fff; border:none; border-radius:6px; padding:2px 8px; font-size:11px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">
      החלף
    </button>
    <button id="kb-dismiss-btn" style="background:transparent; color:#94a3b8; border:none; font-size:13px; cursor:pointer; padding:0 2px;">
      ✕
    </button>
  `;

  document.body.appendChild(glassBubble);

  glassBubble.querySelector("#kb-accept-btn")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    acceptSuggestion();
  });

  glassBubble.querySelector("#kb-tab-badge")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    acceptSuggestion();
  });

  glassBubble.querySelector("#kb-dismiss-btn")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    if (currentTargetWord) processedWordsHistory.add(currentTargetWord.toLowerCase());
    removeBubble();
  });
}

function showBubble(el, originalWord, suggestion) {
  if (isDismissedForDomain || !el) return;
  ensureGlassBubbleCreated();

  currentSuggestion = suggestion;
  currentTargetWord = originalWord;

  const wordSpan = glassBubble.querySelector("#kb-suggest-word");
  if (wordSpan) wordSpan.textContent = suggestion;

  // חישוב מיקום הבועה מעל השדה
  const rect = el.getBoundingClientRect();
  const bubbleTop = Math.max(window.scrollY + rect.top - 42, 10);
  const bubbleLeft = Math.max(window.scrollX + rect.left + 10, 10);

  glassBubble.style.top = `${bubbleTop}px`;
  glassBubble.style.left = `${bubbleLeft}px`;
  glassBubble.style.visibility = "visible";

  requestAnimationFrame(() => {
    glassBubble.style.opacity = "1";
    glassBubble.style.transform = "translateY(0) scale(1)";
  });
}

function removeBubble() {
  if (!glassBubble) return;
  glassBubble.style.opacity = "0";
  glassBubble.style.transform = "translateY(5px) scale(0.95)";
  setTimeout(() => {
    if (glassBubble) glassBubble.style.visibility = "hidden";
  }, 200);
  currentSuggestion = null;
  currentTargetWord = null;
}

function acceptSuggestion() {
  if (!activeField || !currentSuggestion || !currentTargetWord) return;
  console.log(`💡 [Keyboard Translator] מקבל הצעה: "${currentTargetWord}" -> "${currentSuggestion}"`);

  // הוספה להיסטוריה למניעת כפילויות
  processedWordsHistory.add(currentTargetWord.toLowerCase());
  processedWordsHistory.add(currentSuggestion.toLowerCase());

  replaceLastWordInField(activeField, currentTargetWord, currentSuggestion);
  removeBubble();
  hideFloatingButton();
}

// ==============================================================================
// 5. כפתור המרה צף (Floating Action Button)
// ==============================================================================
function ensureFloatingButtonCreated() {
  if (floatingBtn) return;

  floatingBtn = document.createElement("div");
  floatingBtn.id = "kb-translator-float-btn";
  floatingBtn.innerHTML = "🌐";
  floatingBtn.title = "לחץ להמרת הטקסט הפעיל או המסומן";

  Object.assign(floatingBtn.style, {
    position: "absolute", zIndex: "2147483647", width: "28px", height: "28px",
    background: "#2563eb", color: "#fff", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
    cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
    border: "2px solid #fff", userSelect: "none",
    opacity: "0", transform: "scale(0.7)", visibility: "hidden", pointerEvents: "none",
    transition: "opacity 0.18s ease, transform 0.18s ease"
  });

  const closeBtn = document.createElement("div");
  closeBtn.innerHTML = "✕";
  closeBtn.title = "הסתר באתר זה";
  Object.assign(closeBtn.style, {
    position: "absolute", top: "-5px", right: "-5px", width: "15px", height: "15px",
    background: "#ef4444", color: "#fff", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px",
    cursor: "pointer", border: "1.5px solid #fff", opacity: "0", transition: "opacity 0.15s ease"
  });

  floatingBtn.addEventListener("mouseover", () => {
    floatingBtn.style.opacity = "1";
    floatingBtn.style.transform = "scale(1.1)";
    closeBtn.style.opacity = "1";
  });
  floatingBtn.addEventListener("mouseout", () => {
    floatingBtn.style.opacity = "0.75";
    floatingBtn.style.transform = "scale(1)";
    closeBtn.style.opacity = "0";
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    isDismissedForDomain = true;
    hideFloatingButton();
    removeBubble();
    if (chrome?.storage?.local) chrome.storage.local.set({ [DISMISS_KEY]: true });
  });

  floatingBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    const target = activeField || getRootInput(document.activeElement);
    if (!target) return;

    const selInfo = getSelectionInfo(target);
    if (selInfo && selInfo.text && selInfo.text.trim().length > 0) {
      replaceSelectionText(target, translateText(selInfo.text));
    } else {
      setFieldText(target, translateText(getFieldText(target)));
    }
    hideFloatingButton();
    removeBubble();
  });

  floatingBtn.appendChild(closeBtn);
  document.body.appendChild(floatingBtn);
}

function showFloatingButtonAt(el, anchorRect) {
  if (isDismissedForDomain || !el) return;
  ensureFloatingButtonCreated();

  const rect = anchorRect || el.getBoundingClientRect();
  floatingBtn.style.top = `${Math.max(window.scrollY + rect.top - 36, 10)}px`;
  floatingBtn.style.left = `${window.scrollX + rect.left}px`;
  floatingBtn.style.visibility = "visible";
  floatingBtn.style.pointerEvents = "auto";

  requestAnimationFrame(() => {
    floatingBtn.style.opacity = "0.85";
    floatingBtn.style.transform = "scale(1)";
  });
}

function hideFloatingButton() {
  if (!floatingBtn) return;
  floatingBtn.style.opacity = "0";
  floatingBtn.style.transform = "scale(0.7)";
  floatingBtn.style.pointerEvents = "none";
  setTimeout(() => {
    if (floatingBtn) floatingBtn.style.visibility = "hidden";
  }, 200);
}

// ==============================================================================
// 6. מאזיני אירועים - הקלדה, מקש Tab, ובחירת טקסט
// ==============================================================================
document.addEventListener("keydown", (e) => {
  const rootInput = getRootInput(e.target);
  if (rootInput) activeField = rootInput;

  // יירוט מקש TAB כשבועת ההצעה פעילה! (התכונה המרכזית שהובטחה)
  if (e.key === "Tab" && currentSuggestion && glassBubble && glassBubble.style.visibility === "visible") {
    e.preventDefault();
    e.stopPropagation();
    acceptSuggestion();
    return;
  }

  // מקש Escape סוגר את ההצעה
  if (e.key === "Escape") {
    removeBubble();
    hideFloatingButton();
  }
}, true);

document.addEventListener("keyup", (e) => {
  if (!activeField) return;

  // בדיקה בסיום מילה (רווח, Enter, סימני פיסוק)
  if (e.key === " " || e.key === "Enter" || e.key === "?" || e.key === "!" || e.key === "-") {
    if (e.key === "Enter") {
      removeBubble();
      hideFloatingButton();
      return;
    }

    const text = getFieldText(activeField) || "";
    const words = text.trim().split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord) {
      const cleanWord = lastWord
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/^[?#!$%^&*_\-+=()[\]{}|\\:~`]+|[?#!$%^&*_\-+=()[\]{}|\\:~`]+$/g, "");

      if (isSuspiciousWord(cleanWord)) {
        const suggestion = translateText(cleanWord);
        showBubble(activeField, cleanWord, suggestion);
        showFloatingButtonAt(activeField);
      } else {
        removeBubble();
        hideFloatingButton();
      }
    }
  }
}, true);

document.addEventListener("mouseup", (e) => {
  if (glassBubble && (e.target === glassBubble || glassBubble.contains(e.target))) return;
  if (floatingBtn && (e.target === floatingBtn || floatingBtn.contains(e.target))) return;

  const rootInput = getRootInput(e.target);
  if (!rootInput || isDismissedForDomain) return;

  activeField = rootInput;
  const selInfo = getSelectionInfo(rootInput);
  if (selInfo && selInfo.text && selInfo.text.trim().length > 0) {
    showFloatingButtonAt(rootInput, selInfo.rect);
  }
}, true);

// האזנה להודעות מ-popup.js ו-background.js
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "translate_field") {
    const target = activeField || getRootInput(document.activeElement);
    if (target) {
      const selInfo = getSelectionInfo(target);
      if (selInfo && selInfo.text) {
        replaceSelectionText(target, translateText(selInfo.text));
      } else {
        setFieldText(target, translateText(getFieldText(target)));
      }
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, message: "No active field found" });
    }
  }
});
