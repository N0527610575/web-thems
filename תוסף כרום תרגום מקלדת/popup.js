document.getElementById("trigger-btn").addEventListener("click", () => {
  const feedback = document.getElementById("feedback");
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "translate_field" }, (response) => {
        if (chrome.runtime.lastError) {
          if (feedback) {
            feedback.style.color = "#f87171";
            feedback.textContent = "רענן את הדף (F5) כדי להפעיל את התוסף באתר זה.";
            feedback.style.display = "block";
          }
          return;
        }
        if (feedback) {
          feedback.style.color = "#34d399";
          feedback.textContent = "השדה תורגם בהצלחה! ✓";
          feedback.style.display = "block";
          setTimeout(() => {
            feedback.style.display = "none";
          }, 2500);
        }
      });
    }
  });
});
