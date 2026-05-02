const CHILD_COINS_KEY_PREFIX = "tomoChildCoins";

function getChildCoinsKey() {
  if (typeof window === "undefined") return CHILD_COINS_KEY_PREFIX;
  const childId = window.localStorage.getItem("selectedChildId");
  return childId ? `${CHILD_COINS_KEY_PREFIX}:${childId}` : CHILD_COINS_KEY_PREFIX;
}

export function readChildCoins(fallback: number) {
  if (typeof window === "undefined") return fallback;
  const storedValue = window.localStorage.getItem(getChildCoinsKey());
  const parsedValue = storedValue ? Number(storedValue) : Number.NaN;
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

export function saveChildCoins(amount: number) {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(amount) || amount <= 0) return;
  window.localStorage.setItem(getChildCoinsKey(), String(amount));
}
