import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isValidHttpUrl = (string: string): boolean => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
  } catch (_) {
    return false;
  }
};

// Validates a string to ensure it's a safe CSS color value.
// Allows hex (3, 4, 6, 8 digits), rgb, rgba, hsl, hsla, and common named colors.
// Prevents injection of HTML or script tags by strictly adhering to color formats.
export const isValidCssColor = (colorString: string | undefined | null): boolean => {
  if (!colorString) {
    return false;
  }

  const s = colorString.trim();

  // Regex for hex, rgb(a), hsl(a)
  // Allows for spaces around numbers and commas
  const commonColorRegex = /^(#([0-9a-f]{3,4}){1,2}|rgba?\(\s*\d+%?\s*(,\s*\d*%?\s*){2}(,\s*(0|1|0?\.\d+))?\s*\)|hsla?\(\s*\d+%?\s*(,\s*\d+%?\s*){2}(,\s*(0|1|0?\.\d+))?\s*\))$/i;

  // Regex for named CSS colors (simplified, not exhaustive, but covers common cases and avoids injection)
  // For a truly exhaustive list, a library or a much larger regex would be needed.
  // This focuses on preventing unsafe characters.
  const namedColorRegex = /^[a-z]+$/i;

  // Test against the regexes
  if (commonColorRegex.test(s) || namedColorRegex.test(s)) {
    // Further check to ensure no tricky characters slipped through, especially for named colors
    if (s.includes('<') || s.includes('>') || s.includes('"') || s.includes("'") || s.includes(';') || (s.includes('(') && !commonColorRegex.test(s)) ) {
        return false;
    }
    return true;
  }

  return false;
};

// YouTube URL kontrolü yapan fonksiyon
export const isYouTubeUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.hostname === 'www.youtube.com' || 
      parsedUrl.hostname === 'youtube.com' || 
      parsedUrl.hostname === 'youtu.be') &&
      (parsedUrl.pathname.includes('/watch') || 
      parsedUrl.hostname === 'youtu.be')
    );
  } catch (_) {
    return false;
  }
};

// YouTube URL'inden video ID çıkartan fonksiyon
export const getYouTubeVideoId = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    
    // youtube.com/watch?v=ID formatı
    if ((parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') && 
        parsedUrl.pathname.includes('/watch')) {
      return parsedUrl.searchParams.get('v');
    }
    
    // youtu.be/ID formatı
    if (parsedUrl.hostname === 'youtu.be') {
      return parsedUrl.pathname.substring(1);
    }
    
    return null;
  } catch (_) {
    return null;
  }
};
