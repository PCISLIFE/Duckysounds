const toggle = document.getElementById("toggle");
const statusEl = document.getElementById("status");

function setStatus(isEnabled) {
  statusEl.textContent = isEnabled ? "Quacking is ON 🦆" : "Quacking is OFF 🔇";
}

chrome.storage.sync.get({ enabled: true }, (data) => {
  toggle.checked = !!data.enabled;
  setStatus(toggle.checked);
});

toggle.addEventListener("change", () => {
  const isEnabled = toggle.checked;
  chrome.storage.sync.set({ enabled: isEnabled }, () => {
    setStatus(isEnabled);
  });
});
