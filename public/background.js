chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "fetchSuggestions") {
    const url = `https://www.google.com/complete/search?sclient=psy-ab&q=${encodeURIComponent(
      message.query
    )}`;
    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        // parse non-standard JSON (JSONP-like)
        const match = text.match(
          /^\s*window\.(google|suggestions)\.ac\((.*)\);?\s*$/
        );
        const raw = match ? match[2] : text;
        const data = JSON.parse(raw);
        sendResponse(data[1]); // suggestions array
      })
      .catch((err) => sendResponse([]));
    return true; // keeps the message channel open for async response
  }
});

chrome.runtime.setUninstallURL("https://evolve-app.com/uninstall");
