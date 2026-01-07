(() => {
  // Quack files in your extension folder:
  const SOUNDS = ["duck1.mp3", "duck2.mp3", "duck3.mp3"];

  // Controls:
  const MIN_GAP_MS = 2500;  // minimum time between quacks
  const MAX_GAP_MS = 9000;  // maximum time between quacks
  const EXTRA_CHANCE = 0.35; // chance to quack when cooldown is over (0..1)
  const VOLUME = 0.9;

  let nextAllowedAt = 0;

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

    // If the browser blocks playback for any reason, ignore silently
    audio.play().catch(() => {});
  }

  // Capture phase so it triggers even if the page stops propagation
  window.addEventListener(
    "click",
    () => {
      const now = Date.now();

      // If still in cooldown, do nothing
      if (now < nextAllowedAt) return;

      // Random chance gate
      if (Math.random() > EXTRA_CHANCE) {
        // Even if we don't quack, still schedule next window to keep it "random intervals"
        scheduleNext(now);
        return;
      }

      quack();
      scheduleNext(now);
    },
    { capture: true }
  );

  // Start with a random delay so it doesn't always quack immediately after install
  scheduleNext(Date.now());
})();
