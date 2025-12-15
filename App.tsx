import React, { useState, useCallback } from 'react';
import { EditorPane } from './components/EditorPane';
import { Button } from './components/Button';
import { translateText } from './services/geminiService';
import { PLACEHOLDER_TEXT } from './constants';
import { ViewMode, TranslationStyle } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Split);
  const [style, setStyle] = useState<TranslationStyle>('default');
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await translateText(inputText, style);
      setOutputText(result);
    } catch (err) {
      setError("An error occurred while communicating with the translation engine. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, style]);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  const handleLoadExample = () => {
    setInputText(PLACEHOLDER_TEXT);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand-200">
              LN
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pro Translator <span className="text-xs font-normal text-gray-500 ml-2 px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">Powered by Gemini 2.5 Pro</span></h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewMode(ViewMode.Split)} 
              className={`p-2 rounded-md transition-colors ${viewMode === ViewMode.Split ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Split View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
             <button 
              onClick={() => setViewMode(ViewMode.Focus)} 
              className={`p-2 rounded-md transition-colors ${viewMode === ViewMode.Focus ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Focus View (Output Only)"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
             {/* Style Selector */}
             <div className="relative inline-block text-left min-w-[160px]">
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as TranslationStyle)}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-700 py-2.5 pl-3 pr-10 text-sm font-medium focus:border-brand-500 focus:ring-brand-500 border hover:bg-gray-100 transition-colors cursor-pointer appearance-none"
                >
                  <option value="default">Auto-detect Style</option>
                  <option value="fantasy">✨ Fantasy / Isekai</option>
                  <option value="slice_of_life">☕ Slice of Life</option>
                  <option value="action">⚔️ Action / Combat</option>
                  <option value="mystery">🕵️ Mystery / Horror</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

            <Button onClick={handleTranslate} isLoading={isLoading} disabled={!inputText}>
              Translate
            </Button>
            <Button variant="ghost" onClick={handleClear} disabled={isLoading || (!inputText && !outputText)}>
              Clear
            </Button>
          </div>
          
          {!inputText && (
            <button onClick={handleLoadExample} className="text-sm text-brand-600 hover:text-brand-800 underline px-2">
              Load Example
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className={`flex-grow grid gap-6 ${viewMode === ViewMode.Split ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Input Panel */}
          {(viewMode === ViewMode.Split || !outputText) && (
            <div className={`flex flex-col h-[600px] lg:h-[calc(100vh-280px)] ${viewMode === ViewMode.Focus ? 'hidden' : ''}`}>
               <EditorPane 
                label="English Source (HTML/Text)" 
                value={inputText} 
                onChange={setInputText}
                placeholder="Paste your Light Novel / Web Novel text here..."
               />
            </div>
          )}

          {/* Output Panel */}
          {(viewMode === ViewMode.Split || outputText) && (
             <div className="flex flex-col h-[600px] lg:h-[calc(100vh-280px)]">
              <EditorPane 
                label="Vietnamese Translation" 
                value={outputText} 
                readOnly
                placeholder="Translation will appear here..."
              />
            </div>
          )}
        </div>
        
        {/* Helper Note */}
        <div className="text-center text-sm text-gray-400 pb-4">
          Strictly adhering to name preservation, HTML structure, and character relationships rules.
        </div>
      </main>
    </div>
  );
};

export default App;