// ==============================================================================
// 1. מקלדת עברית-אנגלית ומפות תרגום (בהתבסס על content.js של התוסף)
// ==============================================================================
export const engToHeb: Record<string, string> = {
  'q': '/', 'w': '\'', 'e': 'ק', 'r': 'ר', 't': 'א', 'y': 'ט', 'u': 'ו', 'i': 'ן', 'o': 'ם', 'p': 'פ',
  'a': 'ש', 's': 'ד', 'd': 'ג', 'f': 'כ', 'g': 'ע', 'h': 'י', 'j': 'ח', 'k': 'ל', 'l': 'ך', ';': 'ף', '\'': ',',
  'z': 'ז', 'x': 'ס', 'c': 'ב', 'v': 'ה', 'b': 'נ', 'n': 'מ', 'm': 'צ', ',': 'ת', '.': 'ץ', '/': '.'
};

export const hebToEng: Record<string, string> = {};
for (const [e, h] of Object.entries(engToHeb)) {
  hebToEng[h] = e;
}

// תרגום ישיר של תווים
export function translateText(text: string): string {
  if (!text) return "";
  let res = "";
  for (const char of text) {
    const lower = char.toLowerCase();
    if (engToHeb[lower]) {
      res += engToHeb[lower];
    } else if (hebToEng[char]) {
      res += hebToEng[char];
    } else {
      res += char;
    }
  }
  return res;
}

export const FINAL_LETTERS = 'ךםןףץ';

export function isEnglishLayoutWord(word: string): boolean {
  return /^[A-Za-z,.\/;']+$/.test(word);
}

export function isHebrewWord(word: string): boolean {
  return /^[\u05D0-\u05EA]+$/.test(word);
}

export function hasMisplacedFinalLetter(word: string): boolean {
  if (!isHebrewWord(word) || word.length < 2) return false;
  for (let i = 0; i < word.length - 1; i++) {
    if (FINAL_LETTERS.includes(word[i])) return true;
  }
  return false;
}

// האלגוריתם המקורי מתוך content.js
export function isSuspiciousWordOriginal(word: string): boolean {
  if (!word || word.length < 2) return false;

  if (isEnglishLayoutWord(word)) {
    const translated = translateText(word);
    return isHebrewWord(translated) && !hasMisplacedFinalLetter(translated);
  }

  return hasMisplacedFinalLetter(word);
}

export function shouldSuggestOriginal(word: string, translatedWord: string): boolean {
  if (!word || word.length < 2) return false;
  return isSuspiciousWordOriginal(word) && !isSuspiciousWordOriginal(translatedWord);
}

// רשימת מילים נפוצות באנגלית (שמדגימה את הכשל של האלגוריתם המקורי שאין לו מילון/API)
export const COMMON_ENGLISH_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he',
  'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
  'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
  'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
  'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has', 'had', 'car', 'cat', 'dog', 'hello',
  'test', 'email', 'google', 'facebook', 'login', 'web', 'app', 'code', 'link', 'page', 'site'
]);

// רשימת מילים נפוצות בעברית לבדיקת תקינות התרגום
export const COMMON_HEBREW_WORDS = new Set([
  'שלום', 'תודה', 'בבקשה', 'מה', 'נשמע', 'איך', 'הולך', 'טוב', 'מאוד', 'אני', 'רוצה', 'אתה', 'הוא',
  'היא', 'אנחנו', 'הם', 'שלך', 'שלי', 'שלו', 'שלה', 'זה', 'זאת', 'אלה', 'אלו', 'על', 'אל', 'עם',
  'את', 'אם', 'כן', 'לא', 'אבל', 'כי', 'או', 'גם', 'רק', 'כבר', 'עכשיו', 'היום', 'מחר', 'אתמול',
  'בוקר', 'ערב', 'צהריים', 'לילה', 'שבוע', 'חודש', 'שנה', 'זמן', 'מקום', 'דבר', 'איש', 'אדם',
  'אישה', 'ילד', 'ילדה', 'בית', 'דרך', 'עבודה', 'מחשב', 'טלפון', 'הודעה', 'פגישה', 'שיחה', 'מייל',
  'בסדר', 'מצוין', 'יופי', 'אוקיי', 'סבבה', 'יאללה', 'היי', 'ביי', 'להתראות', 'הכל', 'כלום'
]);

// אלגוריתם חכם מבוסס מילון/אינטליגנציה (מראה כיצד API או מילון פותר את הבעיה)
export function evaluateWordIntelligence(word: string): {
  isMistyped: boolean;
  confidence: 'high' | 'medium' | 'low';
  translated: string;
  reason: string;
} {
  const clean = word.toLowerCase().trim();
  const translated = translateText(word);
  const cleanTranslated = translated.toLowerCase().trim();

  // אם המילה מופיעה במילון אנגלי תקני - זו מילה באנגלית, אל תציע לתקן אותה!
  if (COMMON_ENGLISH_WORDS.has(clean)) {
    return {
      isMistyped: false,
      confidence: 'high',
      translated,
      reason: `זוהתה מילה אמיתית באנגלית ("${word}"). התוסף המקורי שוגה ומציע להמיר אותה.`
    };
  }

  // אם התרגום הוא מילה עברית נפוצה וידועה
  if (COMMON_HEBREW_WORDS.has(cleanTranslated)) {
    return {
      isMistyped: true,
      confidence: 'high',
      translated,
      reason: `התרגום יוצר מילה עברית ברורה ונפוצה: "${translated}". סבירות גבוהה מאוד לטעות פריסה.`
    };
  }

  // בדיקת אותיות סופיות
  if (hasMisplacedFinalLetter(cleanTranslated)) {
    return {
      isMistyped: false,
      confidence: 'high',
      translated,
      reason: `התרגום כולל אותיות סופיות באמצע מילה, אינו תקין.`
    };
  }

  if (hasMisplacedFinalLetter(clean)) {
    return {
      isMistyped: true,
      confidence: 'medium',
      translated,
      reason: `המילה המקורית כוללת אותיות סופיות במקום לא תקין.`
    };
  }

  // בדיקת כלל המקור מול שיפור
  const originalCheck = isSuspiciousWordOriginal(word);
  return {
    isMistyped: originalCheck,
    confidence: 'low',
    translated,
    reason: originalCheck
      ? `התוסף המקורי מזהה זאת כשגיאה עקב תווים מפריסה אנגלית, אך ללא בדיקת מילון אין ודאות.`
      : `המילה לא נחשבת לשגיאה לפי הכללים הקיימים.`
  };
}
