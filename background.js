const refreshIntervals = {};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "start") {
    const { tabId, seconds } = msg;

    if (refreshIntervals[tabId]) {
      clearInterval(refreshIntervals[tabId]);
    }

    refreshIntervals[tabId] = setInterval(() => {
      chrome.tabs.reload(tabId);
    }, seconds * 1000);

  } else if (msg.action === "stop") {
    const { tabId } = msg;
    if (refreshIntervals[tabId]) {
      clearInterval(refreshIntervals[tabId]);
      delete refreshIntervals[tabId];
    }
  }
});

// ✅ Keep refreshing even if popup is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (refreshIntervals[tabId]) {
    clearInterval(refreshIntervals[tabId]);
    delete refreshIntervals[tabId];
  }
});

// ✅ Restore refresh when browser restarts
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(null, (data) => {
    for (const tabId in data) {
      const seconds = data[tabId];
      chrome.tabs.get(parseInt(tabId), (tab) => {
        if (tab) {
          refreshIntervals[tab.id] = setInterval(() => {
            chrome.tabs.reload(tab.id);
          }, seconds * 1000);
        }
      });
    }
  });
});
