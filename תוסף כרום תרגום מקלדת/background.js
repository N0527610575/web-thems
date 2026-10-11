// ==============================================================================
// Service Worker - background.js
// גרסה v2.2.0
// ==============================================================================

chrome.runtime.onInstalled.addListener(() => {
  console.log("🌐 [Keyboard Translator] Extension installed & active (v2.2.0)");
});

// מאזין להודעות ושולח לטאב הפעיל באופן אמין
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "trigger_translation" || request.action === "translate_field") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "translate_field" }, (response) => {
          sendResponse(response || { success: true });
        });
      } else {
        sendResponse({ success: false, error: "No active tab" });
      }
    });
    return true; // מחזיק את ערוץ התשובה פתוח עבור async
  }
});
