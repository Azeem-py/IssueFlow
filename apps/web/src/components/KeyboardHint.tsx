import React from 'react';
import { Kbd } from '@issueflow/ui';

interface KeyboardHintProps {
  keys: string[];
}

export function KeyboardHint({ keys }: KeyboardHintProps) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {keys.map((key, index) => (
        <Kbd key={index} className="h-4 min-w-4 px-1 text-[9px]">
          {key}
        </Kbd>
      ))}
    </span>
  );
}
