import { useEffect } from 'react';

const BASE_TITLE = 'SaveethaAM';

/**
 * Sets the document title for SEO purposes.
 * Each page gets a unique title to improve Google indexing.
 * 
 * @param {string} pageTitle - The page-specific title
 * @param {string} [description] - Optional meta description override
 */
export function usePageTitle(pageTitle, description) {
  useEffect(() => {
    // Set page title
    const fullTitle = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : `SIMATS Attendance Manager | Saveetha Attendance Calculator & Tracker`;
    document.title = fullTitle;

    // Update meta description if provided
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }

    // Cleanup: restore default title when unmounting
    return () => {
      document.title = `SIMATS Attendance Manager | Saveetha Attendance Calculator & Tracker`;
      // Restore default meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Free attendance calculator for SIMATS & Saveetha Engineering College students. Track attendance percentage, calculate how many classes you can bunk, simulate schedules, get daily email reports, and sync directly from the ARMS portal. Never miss the 80% mark again.');
      }
    };
  }, [pageTitle, description]);
}
