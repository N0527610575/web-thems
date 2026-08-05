document.getElementById("trigger-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "translate_field" }).catch(() => {
        alert("נא להיכנס לאתר אינטרנט רגיל ולרענן את הדף (F5) לפני ההפעלת התוסף!");
      });
    }
  });
});