import React, { useState, useCallback } from 'react';
import { EditorPane } from './components/EditorPane';
import { Button } from './components/Button';
import { translateText } from './services/geminiService';
import { PLACEHOLDER_TEXT } from './constants';
import { ViewMode, TranslationStyle, Relationship } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Split);
  const [style, setStyle] = useState<TranslationStyle>('default');
  const [error, setError] = useState<string | null>(null);

  // Relationship State
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [showRelations, setShowRelations] = useState<boolean>(false);
  const [newRelSource, setNewRelSource] = useState('');
  const [newRelRelation, setNewRelRelation] = useState('');
  const [newRelTarget, setNewRelTarget] = useState('');

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await translateText(inputText, style, relationships);
      setOutputText(result);
    } catch (err) {
      setError("An error occurred while communicating with the translation engine. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, style, relationships]);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  const handleLoadExample = () => {
    setInputText(PLACEHOLDER_TEXT);
  };

  const addRelationship = () => {
    if (!newRelSource.trim() || !newRelRelation.trim() || !newRelTarget.trim()) return;
    
    const newRel: Relationship = {
      id: Date.now().toString(),
      source: newRelSource.trim(),
      relation: newRelRelation.trim(),
      target: newRelTarget.trim()
    };
    
    setRelationships([...relationships, newRel]);
    setNewRelSource('');
    setNewRelRelation('');
    setNewRelTarget('');
  };

  const removeRelationship = (id: string) => {
    setRelationships(relationships.filter(r => r.id !== id));
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2-2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
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
        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all">
          <div className="flex flex-wrap items-center justify-between gap-4">
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

              {/* Relationship Toggle */}
              <button
                onClick={() => setShowRelations(!showRelations)}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${showRelations ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Relationships {relationships.length > 0 && `(${relationships.length})`}</span>
              </button>

              <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>

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

          {/* Relationship Editor Panel */}
          {showRelations && (
            <div className="pt-4 mt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-brand-100 text-brand-700 p-1 rounded mr-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Define Character Relationships
                  <span className="ml-2 text-xs font-normal text-gray-500">(These rules will override default translations)</span>
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Subject (e.g. Elara)" 
                    value={newRelSource}
                    onChange={(e) => setNewRelSource(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm px-3 py-2"
                  />
                  <div className="flex items-center justify-center text-gray-400 text-sm font-medium px-1">is</div>
                  <input 
                    type="text" 
                    placeholder="Relation (e.g. older sister)" 
                    value={newRelRelation}
                    onChange={(e) => setNewRelRelation(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm px-3 py-2"
                  />
                  <div className="flex items-center justify-center text-gray-400 text-sm font-medium px-1">of</div>
                  <input 
                    type="text" 
                    placeholder="Target (e.g. Kael)" 
                    value={newRelTarget}
                    onChange={(e) => setNewRelTarget(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm px-3 py-2"
                  />
                  <button 
                    onClick={addRelationship}
                    disabled={!newRelSource || !newRelRelation || !newRelTarget}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Rule
                  </button>
                </div>

                {relationships.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {relationships.map((rel) => (
                      <div key={rel.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200 text-sm shadow-sm group">
                        <span className="truncate">
                          <span className="font-semibold text-brand-700">{rel.source}</span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className="text-gray-600 italic">{rel.relation}</span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className="font-semibold text-brand-700">{rel.target}</span>
                        </span>
                        <button 
                          onClick={() => removeRelationship(rel.id)}
                          className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center italic mt-2">No custom relationships added yet.</p>
                )}
              </div>
            </div>
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
            <div className={`flex flex-col h-[600px] lg:h-[calc(100vh-320px)] ${viewMode === ViewMode.Focus ? 'hidden' : ''}`}>
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
             <div className="flex flex-col h-[600px] lg:h-[calc(100vh-320px)]">
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