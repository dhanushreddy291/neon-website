import copyToClipboard from 'copy-to-clipboard';
import { useEffect, useState, useCallback } from 'react';

export default function useCopyToClipboard(resetInterval = null) {
  const [isCopied, setCopied] = useState(false);

  const handleCopy = useCallback((text) => {
    if (typeof text !== 'string' && typeof text !== 'number') {
      setCopied(false);
      return;
    }
    const str = text.toString();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(str).then(() => setCopied(true)).catch(() => setCopied(false));
    } else {
      copyToClipboard(str);
      setCopied(true);
    }
  }, []);

  useEffect(() => {
    let timeout;
    if (isCopied && resetInterval) {
      timeout = setTimeout(() => setCopied(false), resetInterval);
    }
    return () => clearTimeout(timeout);
  }, [isCopied, resetInterval]);

  return { isCopied, handleCopy };
}
