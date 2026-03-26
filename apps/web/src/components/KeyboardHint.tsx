import React from 'react';

interface KeyboardHintProps {
  keys: string[];
}

export function KeyboardHint({ keys }: KeyboardHintProps) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <span
          key={index}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
        >
          {key}
        </span>
      ))}
    </div>
  );
}
