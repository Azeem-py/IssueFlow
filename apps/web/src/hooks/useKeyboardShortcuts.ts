import { useEffect, useState } from 'react';

type ShortcutCallback = () => void;

interface ShortcutMap {
  [keySequence: string]: ShortcutCallback;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      let keyToRecord = key;
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;

      // Always allow Command/Ctrl + K regardless of focus
      if (key === 'k' && isCmdOrCtrl) {
        event.preventDefault(); // Prevent default browser behavior for Cmd+K
        keyToRecord = 'cmd+k';
        if (shortcuts[keyToRecord]) {
          shortcuts[keyToRecord]();
          setKeys([]);
          return;
        }
      }

      // Ignore other shortcuts if typing in input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const newKeys = [...keys, keyToRecord];

      // Keep only the last 2 keys for sequences like 'g i'
      if (newKeys.length > 2) {
        newKeys.shift();
      }

      setKeys(newKeys);

      // Check for single key shortcut
      if (shortcuts[keyToRecord]) {
        shortcuts[keyToRecord]();
        setKeys([]);
        return;
      }

      // Check for two-key sequence shortcut
      const sequence = newKeys.join(' ');
      if (shortcuts[sequence]) {
        shortcuts[sequence]();
        setKeys([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, shortcuts]);
}
