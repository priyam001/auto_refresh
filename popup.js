const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const status = document.getElementById("status");
const timeInput = document.getElementById("refreshTime");
const timerEl = document.getElementById("timer");

let timerInterval = null;
let startTime = null;

// Format time as hh:mm:ss
function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let hrs = Math.floor(totalSeconds / 3600);
  let mins = Math.floor((totalSeconds % 3600) / 60);
  let secs = totalSeconds % 60;
  return (
    (hrs > 0 ? hrs.toString().padStart(2, "0") + ":" : "") +
    mins.toString().padStart(2, "0") + ":" +
    secs.toString().padStart(2, "0")
  );
}

function startTimer() {
  startTime = Date.now();
  timerEl.textContent = "⏱ Running: 00:00";
  timerInterval = setInterval(() => {
    let elapsed = Date.now() - startTime;
    timerEl.textContent = "⏱ Running: " + formatTime(elapsed);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  timerEl.textContent = "";
}

// Start auto refresh
startBtn.addEventListener("click", () => {
  const seconds = parseInt(timeInput.value);
  if (isNaN(seconds) || seconds <= 0) {
    alert("Please enter a valid time in seconds.");
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.storage.local.set({ [tabId]: seconds });

    chrome.runtime.sendMessage({ action: "start", tabId, seconds });
    status.textContent = "🔄 Refreshing every " + seconds + " sec";

    stopTimer(); // reset old timer if running
    startTimer();
  });
});

// Stop auto refresh
stopBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.storage.local.remove(tabId.toString());
    chrome.runtime.sendMessage({ action: "stop", tabId });

    status.textContent = "⌚ Idle";
    stopTimer();
  });
});
