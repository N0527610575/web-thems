

// מאזין להודעות מה-popup ושולח ללשונית הפעילה
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "trigger_translation") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "translate_field" }).catch(() => {});
      }
    });
  }
});