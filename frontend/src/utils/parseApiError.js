/**
 * Extract a human-readable error message from an API error response.
 *
 * Handles:
 * - Pydantic 422: { detail: [{ loc: [...], msg: "..." }, ...] }
 * - FastAPI string: { detail: "Some error message" }
 * - Generic axios errors
 */
export function parseApiError(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;

  if (!data) return fallback;

  // If detail is a string, return it directly
  if (typeof data.detail === 'string') {
    return data.detail;
  }

  // If detail is an array (Pydantic validation errors), format them
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    // Get the first error's field name and message
    const firstError = data.detail[0];
    const field = firstError.loc
      ? firstError.loc.filter((l) => l !== 'body').join('.')
      : '';
    const msg = firstError.msg || 'Invalid value';

    // Clean up Pydantic's verbose messages
    const cleanMsg = msg
      .replace(/^Value error, /, '')
      .replace(/^String should /, '')
      .replace(/^string_too_short: /, '');

    if (field) {
      // Capitalize field name and make it readable
      const readableField = field
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return `${readableField}: ${cleanMsg}`;
    }

    return cleanMsg;
  }

  // If detail is something else, try to stringify
  if (data.detail) {
    return String(data.detail);
  }

  // If there's a message field
  if (data.message) {
    return data.message;
  }

  return fallback;
}
