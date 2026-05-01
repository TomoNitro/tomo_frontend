const SAVING_TARGET_KEY_PREFIX = "tomoSavingTarget";

function getSavingTargetKey() {
  if (typeof window === "undefined") return SAVING_TARGET_KEY_PREFIX;
  const childId = window.localStorage.getItem("selectedChildId");
  return childId ? `${SAVING_TARGET_KEY_PREFIX}:${childId}` : SAVING_TARGET_KEY_PREFIX;
}

export function readSavingTargetId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(getSavingTargetKey()) || "";
}

export function saveSavingTargetId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getSavingTargetKey(), id);
}
