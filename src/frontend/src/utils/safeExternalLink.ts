/**
 * Normalizes and validates external links for safe use in the application.
 * Ensures links have proper protocol and are not empty.
 */
export function safeExternalLink(link: string): string {
  if (!link || link.trim() === '') {
    return '#';
  }

  const trimmed = link.trim();
  
  // If it already has a protocol, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // If it looks like a domain, add https://
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`;
  }
  
  // Otherwise return as-is (might be a relative path or anchor)
  return trimmed;
}
