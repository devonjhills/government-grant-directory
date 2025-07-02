/**
 * Utility functions for consistent date parsing and formatting across the application
 */

/**
 * Safely parse a date string that might be in various formats from Grants.gov
 * @param dateString - The date string to parse (e.g., "9/2/2025", "2025-09-02", etc.)
 * @returns A valid Date object or null if parsing fails
 */
export function parseGrantDate(dateString: string | null | undefined): Date | null {
  if (!dateString || dateString === "N/A" || dateString === "") {
    return null;
  }

  // Try parsing the date string
  const parsed = new Date(dateString);
  
  // Check if the parsed date is valid
  if (isNaN(parsed.getTime())) {
    return null;
  }
  
  return parsed;
}

/**
 * Format a date for display in grant cards (short format)
 * @param dateString - The date string to format
 * @returns Formatted date string or "Not specified" if invalid
 */
export function formatGrantCardDate(dateString: string | null | undefined): string {
  const date = parseGrantDate(dateString);
  if (!date) {
    return "Not specified";
  }
  
  return date.toLocaleDateString("en-US");
}

/**
 * Format a date for display in grant details (long format)
 * @param dateString - The date string to format
 * @returns Formatted date string or "Not specified" if invalid
 */
export function formatGrantDetailDate(dateString: string | null | undefined): string {
  const date = parseGrantDate(dateString);
  if (!date) {
    return "Not specified";
  }
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", 
    day: "numeric"
  });
}

/**
 * Check if a date string represents a valid date
 * @param dateString - The date string to check
 * @returns true if the date is valid, false otherwise
 */
export function isValidGrantDate(dateString: string | null | undefined): boolean {
  return parseGrantDate(dateString) !== null;
}