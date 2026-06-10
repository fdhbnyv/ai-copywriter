export function getApiBase(): string {
  if (import.meta.env.DEV) return '';
  const origin = window.location.origin;
  return origin.includes('www.') ? origin : origin.replace('://', '://www.');
}
