(() => {
  const SOUNDS = ["sounds/quack.mp3", "sounds/quackk.mp3"];

  // More frequent quacks:
  const MIN_GAP_MS = 700;
  const MAX_GAP_MS = 2500;
  const EXTRA_CHANCE = 0.65;
  const VOLUME = 0.9;

  // Duck popup config:
  const DUCK_IMG = "icons/icon128.png";
  const DUCK_SIZE_PX = 64;
  const DUCK_LIFETIME_MS = 650;
  const DUCK_RISE_PX = 18;

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

  function showDuckAt(clientX, clientY) {
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL(DUCK_IMG);
    img.alt = "duck";
    img.style.position = "fixed";
    img.style.left = `${clientX}px`;
    img.style.top = `${clientY}px`;
    img.style.width = `${DUCK_SIZE_PX}px`;
    img.style.height = `${DUCK_SIZE_PX}px`;
    img.style.transform = "translate(-50%, -50%)";
    img.style.zIndex = "2147483647";
    img.style.pointerEvents = "none";
    img.style.opacity = "0";
    img.style.transition = `transform ${DUCK_LIFETIME_MS}ms ease, opacity ${DUCK_LIFETIME_MS}ms ease`;
    img.style.filter = "drop-shadow(0 6px 10px rgba(0,0,0,0.25))";

    document.documentElement.appendChild(img);

    requestAnimationFrame(() => {
      img.style.opacity = "1";
      img.style.transform = `translate(-50%, calc(-50% - ${DUCK_RISE_PX}px))`;
    });

    const fadeAt = Math.max(0, DUCK_LIFETIME_MS - 220);
    setTimeout(() => {
      img.style.opacity = "0";
    }, fadeAt);

    setTimeout(() => {
      img.remove();
    }, DUCK_LIFETIME_MS + 80);
  }

  chrome.storage.sync.get({ enabled: true }, (data) => {
    enabled = !!data.enabled;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.enabled) enabled = !!changes.enabled.newValue;
  });

  window.addEventListener(
    "click",
    (e) => {
      if (!enabled) return;

      const now = Date.now();
      if (now < nextAllowedAt) return;

      if (Math.random() < EXTRA_CHANCE) {
        quack();
        showDuckAt(e.clientX, e.clientY);
      }

      scheduleNext(now);
    },
    { capture: true }
  );

  scheduleNext(Date.now());
})();
