import React, { useRef, useMemo } from 'react';

interface EditorPaneProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onCopy?: () => void;
  isHtml?: boolean;
  className?: string;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  onCopy,
  isHtml = false,
  className = ''
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (onCopy) onCopy();
    navigator.clipboard.writeText(value);
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const highlightedContent = useMemo(() => {
    if (!isHtml) return value;

    const escaped = value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped.replace(
      /(&lt;\/?[a-z0-9\-]+(?:.*?)&gt;)/gi, 
      '<span class="text-blue-600 font-medium opacity-60">$1</span>'
    );
  }, [value, isHtml]);

  // Refined typography for better readability
  const typographyClasses = "font-serif text-[15px] leading-7 p-6 break-words whitespace-pre-wrap";

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200/60 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all ${className}`}>
      
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-b border-gray-100 min-h-[36px]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">{label}</span>
          {readOnly && (
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-50 text-green-600 border border-green-100">
              Read-only
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-300 tabular-nums">
             {value.length > 0 ? `${value.length} chars` : ''}
          </span>
          {readOnly && value && (
            <button 
              onClick={handleCopy}
              className="text-gray-400 hover:text-brand-600 transition-colors p-1 rounded-md hover:bg-brand-50"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-grow bg-white isolate group">
        {isHtml && (
          <pre
            ref={preRef}
            className={`absolute inset-0 w-full h-full m-0 overflow-hidden pointer-events-none text-gray-800 ${typographyClasses}`}
            aria-hidden="true"
            style={{ paddingRight: '22px' }} // 6px scrollbar + 16px padding
            dangerouslySetInnerHTML={{ 
              __html: highlightedContent + (value.endsWith('\n') ? '<br />' : '') 
            }}
          />
        )}
        <textarea
          ref={textareaRef}
          onScroll={handleScroll}
          className={`relative w-full h-full resize-none focus:outline-none bg-transparent overflow-y-scroll ${typographyClasses} ${isHtml ? 'text-transparent caret-gray-900 z-10' : 'text-gray-800 placeholder:text-gray-300'}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
        />
      </div>
    </div>
  );
};