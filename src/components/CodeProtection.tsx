'use client';

import { useEffect } from 'react';

/**
 * Client-side code protection:
 * - Disables right-click context menu
 * - Disables text selection via CSS
 * - Blocks keyboard shortcuts (Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, F12)
 * - Blocks drag operations
 * © 2026 Clarice Wang. All rights reserved.
 */
export default function CodeProtection() {
  useEffect(() => {
    // Block right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block dev tools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      // Ctrl+U (view source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I (dev tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+J (console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+C (inspect element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return;
      }
      // Ctrl+S (save page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return;
      }
    };

    // Block drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
