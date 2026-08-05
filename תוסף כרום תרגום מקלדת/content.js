// מדפיס הודעה לקונסול כדי לאשר שהגרסה המעודכנת ביותר נטענה
console.log("🌐 [Keyboard Translator] v2.1.1 Loaded & Ready! (+ selection translate)");

// ==============================================================================
// 1. מילון עברית-אנגלית ופונקציית תרגום
// ==============================================================================
const engToHeb = {
  'q': '/', 'w': '\'', 'e': 'ק', 'r': 'ר', 't': 'א', 'y': 'ט', 'u': 'ו', 'i': 'ן', 'o': 'ם', 'p': 'פ',
  'a': 'ש', 's': 'ד', 'd': 'ג', 'f': 'כ', 'g': 'ע', 'h': 'י', 'j': 'ח', 'k': 'ל', 'l': 'ך', ';': 'ף', '\'': ',',
  'z': 'ז', 'x': 'ס', 'c': 'ב', 'v': 'ה', 'b': 'נ', 'n': 'מ', 'm': 'צ', ',': 'ת', '.': 'ץ', '/': '.'
};
const hebToEng = {};
for (const [e, h] of Object.entries(engToHeb)) hebToEng[h] = e;

function translateText(text) {
  if (!text) return "";
  let res = "";
  for (let char of text) {
    let lower = char.toLowerCase();
    if (engToHeb[lower]) res += engToHeb[lower];
    else if (hebToEng[char]) res += hebToEng[char];
    else res += char;
  }
  return res;
}

// ==============================================================================
// 2. אלגוריתם זיהוי מילים שגויות - תואם למקשי ת', ץ' ו-ף' באנגלית
// ==============================================================================
const FINAL_LETTERS = 'ךםןףץ';

// זיהוי האם המילה הוקלדה על פריסה אנגלית (כולל מקשי הפסיק והנקודה שמייצגים אותיות בעברית)
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

function isSuspiciousWord(word) {
  if (!word || word.length < 2) return false;

  // אם הוקלדו תווים מפריסה אנגלית
  if (isEnglishLayoutWord(word)) {
    const translated = translateText(word);
    // מוודא שהתרגום מייצר מילה חוקית בעברית ללא אותיות סופיות במקום שגוי
    return isHebrewWord(translated) && !hasMisplacedFinalLetter(translated);
  }

  return hasMisplacedFinalLetter(word);
}

function shouldSuggest(word, translatedWord) {
  if (!word || word.length < 2) return false;
  return isSuspiciousWord(word) && !isSuspiciousWord(translatedWord);
}

// ==============================================================================
// 3. הזרקת טקסט חזקה עוקפת React / WhatsApp Web
// ==============================================================================
let activeField = null;
let floatingBtn = null;
let closeBtn = null;
let currentSuggestion = null;
let isDragging = false;
let customBtnPos = null;

const SHOW_DELAY_MS = 350;
const DEFAULT_OPACITY = 0.75;
let showTimer = null;
let isDismissedForDomain = false;

const DISMISS_KEY = `kb_translator_dismissed_${location.hostname}`;

if (chrome?.storage?.local) {
  chrome.storage.local.get([DISMISS_KEY], (result) => {
    isDismissedForDomain = !!result[DISMISS_KEY];
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

function setFieldText(el, text) {
  if (!el) return;

  if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
    el.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);

    // execCommand מייצר בעצמו אירוע input אמיתי - אין צורך לירות עוד אחד ידנית
    // (דיספאץ' כפול גורם לאתרים כמו WhatsApp Web לכתוב את הטקסט פעמיים)
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

function getFieldText(el) {
  if (!el) return "";
  const text = (el.isContentEditable || el.getAttribute('contenteditable') === 'true') ? el.innerText : el.value;
  return text || "";
}

// מחזיר מידע על טקסט מסומן (selection) בתוך שדה, אם קיים
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
    // מונע קריסה בשדות קלט שאינם תומכים בבחירת טקסט (כגון email או number)
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

// מחליף רק את הטקסט המסומן (במקום את כל תוכן השדה)
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
    // ה-selection עדיין פעיל כי mousedown על הכפתור מונע איבוד פוקוס (preventDefault)
    // execCommand מייצר בעצמו אירוע input אמיתי - אין צורך לירות עוד אחד ידנית
    el.focus();
    document.execCommand('insertText', false, newText || "");
  }
}

// ==============================================================================
// 4. כפתור המרה צף
// ==============================================================================
function ensureButtonCreated() {
  if (floatingBtn) return;

  floatingBtn = document.createElement("div");
  floatingBtn.innerHTML = "🌐";
  floatingBtn.title = "לחץ להמרת הטקסט (או גרור אותי למיקום נוח)";

  Object.assign(floatingBtn.style, {
    position: "absolute", zIndex: "2147483647", width: "28px", height: "28px",
    background: "#2563eb", color: "#fff", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px",
    cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
    border: "2px solid #fff", userSelect: "none",
    opacity: "0", transform: "scale(0.7)", visibility: "hidden", pointerEvents: "none",
    transition: "opacity 0.18s ease, transform 0.18s ease"
  });

  closeBtn = document.createElement("div");
  closeBtn.innerHTML = "✕";
  Object.assign(closeBtn.style, {
    position: "absolute", top: "-6px", right: "-6px", width: "16px", height: "16px",
    background: "#ef4444", color: "#fff", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px",
    cursor: "pointer", border: "1.5px solid #fff",
    opacity: "0", pointerEvents: "none", transition: "opacity 0.15s ease"
  });
  closeBtn.title = "הסתר באתר הזה";

  floatingBtn.addEventListener("mouseover", () => {
    if (!isDragging) {
      floatingBtn.style.opacity = "1";
      floatingBtn.style.transform = "scale(1.1)";
      closeBtn.style.opacity = "1";
      closeBtn.style.pointerEvents = "auto";
    }
  });
  floatingBtn.addEventListener("mouseout", () => {
    if (!isDragging) {
      floatingBtn.style.opacity = String(DEFAULT_OPACITY);
      floatingBtn.style.transform = "scale(1)";
      closeBtn.style.opacity = "0";
      closeBtn.style.pointerEvents = "none";
    }
  });

  closeBtn.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    dismissForDomain();
  });

  floatingBtn.addEventListener("mousedown", (e) => {
    if (e.target === closeBtn) return;
    e.preventDefault(); e.stopPropagation();
    isDragging = false;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = floatingBtn.offsetLeft;
    const startTop = floatingBtn.offsetTop;

    function onMouseMove(moveEvent) {
      if (Math.abs(moveEvent.clientX - startX) > 3 || Math.abs(moveEvent.clientY - startY) > 3) {
        isDragging = true;
        floatingBtn.style.cursor = "grabbing";
      }
      floatingBtn.style.left = `${startLeft + (moveEvent.clientX - startX)}px`;
      floatingBtn.style.top = `${startTop + (moveEvent.clientY - startY)}px`;
    }

    function onMouseUp() {
      floatingBtn.style.cursor = "pointer";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (isDragging) customBtnPos = { left: floatingBtn.style.left, top: floatingBtn.style.top };
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  floatingBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isDragging) return;

    let targetField = activeField || document.activeElement;
    targetField = getRootInput(targetField);

    if (targetField) {
      const selInfo = getSelectionInfo(targetField);

      if (selInfo && selInfo.text && selInfo.text.trim().length > 0) {
        console.log(`🌐 [Keyboard Translator] ממיר טקסט מסומן: "${selInfo.text}"`);
        replaceSelectionText(targetField, translateText(selInfo.text));
      } else {
        const textToTranslate = getFieldText(targetField);
        console.log("🌐 [Keyboard Translator] ממיר טקסט שדה מלא...");
        setFieldText(targetField, translateText(textToTranslate));
      }
      hideFloatingButton();
    }
  });

  floatingBtn.appendChild(closeBtn);
  document.body.appendChild(floatingBtn);
}

function dismissForDomain() {
  isDismissedForDomain = true;
  hideFloatingButton();
  if (chrome?.storage?.local) chrome.storage.local.set({ [DISMISS_KEY]: true });
  console.log("🌐 [Keyboard Translator] התוסף הוסתר לצמיתות באתר זה.");
}

function positionButton(el, anchorRect) {
  if (!customBtnPos) {
    const rect = anchorRect || el.getBoundingClientRect();
    floatingBtn.style.top = `${Math.max(window.scrollY + rect.top - 36, 10)}px`;
    floatingBtn.style.left = `${window.scrollX + rect.left}px`;
  } else {
    floatingBtn.style.top = customBtnPos.top;
    floatingBtn.style.left = customBtnPos.left;
  }
}

function trackActiveField(el) {
  if (isDismissedForDomain) return;
  if (activeField !== el) {
    customBtnPos = null;
    activeField = el;
  }
}

function scheduleShowFloatingButton(el, anchorRect) {
  if (isDismissedForDomain) return;
  trackActiveField(el);

  clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    ensureButtonCreated();
    positionButton(el, anchorRect);
    floatingBtn.style.visibility = "visible";
    floatingBtn.style.pointerEvents = "auto";
    requestAnimationFrame(() => {
      floatingBtn.style.opacity = String(DEFAULT_OPACITY);
      floatingBtn.style.transform = "scale(1)";
    });
  }, SHOW_DELAY_MS);
}

function hideFloatingButton() {
  clearTimeout(showTimer);
  if (!floatingBtn) return;
  floatingBtn.style.opacity = "0";
  floatingBtn.style.transform = "scale(0.7)";
  floatingBtn.style.pointerEvents = "none";
  setTimeout(() => {
    if (floatingBtn) floatingBtn.style.visibility = "hidden";
  }, 200);
}

function removeBubble() { return; }
function acceptSuggestion() { return; }

// ==============================================================================
// 5. מאזיני אירועים - הקלדה וניקוי תווים נסתרים
// ==============================================================================
document.addEventListener("mousedown", (e) => {
  if (floatingBtn && (e.target === floatingBtn || floatingBtn.contains(e.target))) e.preventDefault();
}, true);

// בודק אם יש טקסט מסומן בתוך שדה, ואם כן מציג את הכפתור ליד הסימון
function handleSelectionCheck(rawEl) {
  const rootInput = getRootInput(rawEl);
  if (!rootInput || isDismissedForDomain) return;

  const selInfo = getSelectionInfo(rootInput);
  if (selInfo && selInfo.text && selInfo.text.trim().length > 0) {
    trackActiveField(rootInput);
    scheduleShowFloatingButton(rootInput, selInfo.rect);
  }
}

document.addEventListener("mouseup", (e) => {
  // מתעלם מקליקים על הכפתור עצמו
  if (floatingBtn && (e.target === floatingBtn || floatingBtn.contains(e.target))) return;
  handleSelectionCheck(e.target);
}, true);

let selectionCheckTimer = null;
document.addEventListener("selectionchange", () => {
  clearTimeout(selectionCheckTimer);
  selectionCheckTimer = setTimeout(() => {
    handleSelectionCheck(document.activeElement);
  }, 150);
});

document.addEventListener("input", (e) => {
  const rootInput = getRootInput(e.target);
  if (rootInput) {
    trackActiveField(rootInput);
    if (getFieldText(rootInput).trim().length === 0) hideFloatingButton();
  }
}, true);

document.addEventListener("keydown", (e) => {
  const rootInput = getRootInput(e.target);
  if (rootInput && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
    trackActiveField(rootInput);
  }
}, true);

document.addEventListener("keyup", (e) => {
  if (!activeField) return;

  if (e.key === "Backspace" || e.key === "Delete") {
    if (getFieldText(activeField).trim().length === 0) hideFloatingButton();
  }

  // אירוע סיום מילה (רווח, Enter או סימני פיסוק של סוף משפט)
  if (e.key === " " || e.key === "Enter" || e.key === "?" || e.key === "!" || e.key === "-") {
    if (e.key === "Enter") {
      hideFloatingButton();
    } else {
      const text = getFieldText(activeField) || "";
      const words = text.trim().split(/\s+/);
      const lastWord = words[words.length - 1];

      if (lastWord) {
        // ניקוי תווים נסתרים (Zero-Width Spaces) של וואטסאפ וסימני פיסוק שאינם אותיות עבריות
        const cleanWord = lastWord
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/^[?#!$%^&*_\-+=()[\]{}|\\:~`]+|[?#!$%^&*_\-+=()[\]{}|\\:~`]+$/g, "");

        const suggestion = translateText(cleanWord);

        if (shouldSuggest(cleanWord, suggestion)) {
          console.log(`💡 [Keyboard Translator] זיהה שגיאת הקלדה: "${cleanWord}" -> מציע: "${suggestion}"`);
          scheduleShowFloatingButton(activeField);
        } else {
          hideFloatingButton();
        }
      } else {
        hideFloatingButton();
      }
    }
  }
}, true);

document.addEventListener("focusout", () => {
  setTimeout(() => {
    const currentFocus = document.activeElement;
    const isInsideActiveField = activeField && (currentFocus === activeField || activeField.contains(currentFocus));
    const isInsideBtn = floatingBtn && (currentFocus === floatingBtn || floatingBtn.contains(currentFocus));
    if (!isInsideActiveField && !isInsideBtn) hideFloatingButton();
  }, 200);
}, true);

chrome.runtime.onMessage.addListener((req) => {
  if (req.action === "translate_field" && activeField) {
    setFieldText(activeField, translateText(getFieldText(activeField)));
  }
  if (req.action === "reset_dismiss_for_domain") {
    isDismissedForDomain = false;
    if (chrome?.storage?.local) chrome.storage.local.remove([DISMISS_KEY]);
  }
});