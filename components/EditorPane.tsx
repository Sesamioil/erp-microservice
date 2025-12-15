import React, { useRef, useEffect } from 'react';

interface EditorPaneProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onCopy?: () => void;
  isHtml?: boolean;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  onCopy,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    if (onCopy) onCopy();
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
        {readOnly && value && (
          <button 
            onClick={handleCopy}
            className="text-gray-400 hover:text-brand-600 transition-colors p-1 rounded hover:bg-gray-200"
            title="Copy to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
      <div className="relative flex-grow">
        <textarea
          ref={textareaRef}
          className="w-full h-full resize-none p-4 font-serif text-gray-800 text-base leading-relaxed focus:outline-none bg-transparent"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
        />
      </div>
      {/* Character count or extra info could go here */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-right text-xs text-gray-400">
        {value.length} characters
      </div>
    </div>
  );
};