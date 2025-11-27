/**
 * useCopyToClipboard Hook
 *
 * Reusable hook for copy-to-clipboard functionality with toast notifications.
 * Handles the common pattern of:
 * 1. Copy text to clipboard
 * 2. Show success toast
 * 3. Display temporary "copied" state
 * 4. Reset state after timeout
 */

import { useState } from "react";
import { toast } from "sonner";

export function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /**
   * Copy text to clipboard and show feedback
   *
   * @param text - Text to copy
   * @param id - Unique identifier for this copy action (to track which item was copied)
   * @param successMessage - Optional custom success message (defaults to "Copied to clipboard!")
   * @param timeout - How long to show "copied" state in ms (defaults to 2000ms)
   */
  const copy = async (
    text: string,
    id: string,
    successMessage = "Copied to clipboard!",
    timeout = 2000
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(successMessage);
      setTimeout(() => setCopiedId(null), timeout);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error("Copy failed:", error);
    }
  };

  /**
   * Check if a specific item is currently showing "copied" state
   *
   * @param id - Identifier to check
   * @returns True if this item is currently copied
   */
  const isCopied = (id: string) => copiedId === id;

  return { copy, isCopied, copiedId };
}
