export function normalizeSubscriptionName(name: string) {
  return name.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function duplicateSubscriptionMessage(name: string) {
  return `You're already tracking "${name}". Edit that subscription instead.`;
}
