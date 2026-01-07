(() => {
  const SOUNDS = ["sounds/quack.mp3", "sounds/quackk.mp3"];

  const MIN_GAP_MS = 2500;
  const MAX_GAP_MS = 9000;
  const EXTRA_CHANCE = 0.35;
  const VOLUME = 0.9;

  let nextAllowedAt = 0;
  let enabled = true;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function scheduleNext(now) {
    nextAllowedAt = now + randInt(MIN_GAP_MS, MAX_GAP_MS);
  }

  function quack() {
    const file = pickRandom(SOUNDS);
    const url = chrome.runtime.getURL(file);

    const audio = new Audio(url);
    audio.volume = VOLUME;
    audio.play().catch(() => {});
  }

  // Load initial enabled state (default true if not set)
  chrome.storage.sync.get({ enabled: true }, (data) => {
    enabled = !!data.enabled;
  });

  // React instantly when user toggles in popup
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.enabled) enabled = !!changes.enabled.newValue;
  });

  window.addEventListener(
    "click",
    () => {
      if (!enabled) return;

      const now = Date.now();
      if (now < nextAllowedAt) return;

      if (Math.random() > EXTRA_CHANCE) {
        scheduleNext(now);
        return;
      }

      quack();
      scheduleNext(now);
    },
    { capture: true }
  );

  scheduleNext(Date.now());
})();
