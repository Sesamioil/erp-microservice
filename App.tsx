import React, { useState, useCallback, useRef } from 'react';
import { EditorPane } from './components/EditorPane';
import { Button } from './components/Button';
import { translateText } from './services/geminiService';
import { PLACEHOLDER_TEXT } from './constants';
import { ViewMode, TranslationStyle, Relationship, GlossaryTerm, ModelType } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Split);
  const [style, setStyle] = useState<TranslationStyle>('default');
  const [model, setModel] = useState<ModelType>('gemini-3-pro-preview');
  const [error, setError] = useState<string | null>(null);

  // Active Context Tab: 'none' | 'relations' | 'glossary'
  const [activeTab, setActiveTab] = useState<'none' | 'relations' | 'glossary'>('none');

  // Relationship State
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [newRelSource, setNewRelSource] = useState('');
  const [newRelRelation, setNewRelRelation] = useState('');
  const [newRelTarget, setNewRelTarget] = useState('');

  // Glossary State
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [newTermSource, setNewTermSource] = useState('');
  const [newTermTarget, setNewTermTarget] = useState('');
  
  const glossaryFileInputRef = useRef<HTMLInputElement>(null);
  const relationshipFileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await translateText(inputText, model, style, relationships, glossary);
      setOutputText(result);
    } catch (err) {
      setError("An error occurred while communicating with the translation engine. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, model, style, relationships, glossary]);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  const handleLoadExample = () => {
    setInputText(PLACEHOLDER_TEXT);
  };

  // Relationship Handlers
  const addRelationship = () => {
    if (!newRelSource.trim() || !newRelRelation.trim() || !newRelTarget.trim()) return;
    const newRel: Relationship = {
      id: Date.now().toString(),
      source: newRelSource.trim(),
      relation: newRelRelation.trim(),
      target: newRelTarget.trim()
    };
    setRelationships([...relationships, newRel]);
    setNewRelSource(''); setNewRelRelation(''); setNewRelTarget('');
  };

  const removeRelationship = (id: string) => {
    setRelationships(relationships.filter(r => r.id !== id));
  };

  const handleRelationshipFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      const lines = content.split(/\r?\n/);
      const newRels: Relationship[] = [];
      lines.forEach((line, index) => {
        if (!line.trim()) return;
        let parts = line.includes('|') ? line.split('|') : line.split(',');
        if (parts.length >= 3) {
           const source = parts[0].trim();
           const relation = parts[1].trim();
           const target = parts.slice(2).join(line.includes('|') ? '|' : ',').trim();
           if (source && relation && target) {
             newRels.push({
               id: `${Date.now()}-rel-${index}-${Math.random().toString(36).substring(2, 9)}`,
               source, relation, target
             });
           }
        }
      });
      if (newRels.length > 0) setRelationships(prev => [...prev, ...newRels]);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Glossary Handlers
  const addGlossaryTerm = () => {
    if (!newTermSource.trim() || !newTermTarget.trim()) return;
    const newTerm: GlossaryTerm = {
      id: Date.now().toString(),
      source: newTermSource.trim(),
      target: newTermTarget.trim()
    };
    setGlossary([...glossary, newTerm]);
    setNewTermSource(''); setNewTermTarget('');
  };

  const removeGlossaryTerm = (id: string) => {
    setGlossary(glossary.filter(g => g.id !== id));
  };

  const handleGlossaryFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      const lines = content.split(/\r?\n/);
      const newTerms: GlossaryTerm[] = [];
      lines.forEach((line, index) => {
        if (!line.trim()) return;
        let separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          const source = line.substring(0, separatorIndex).trim();
          const target = line.substring(separatorIndex + 1).trim();
          if (source && target) {
             newTerms.push({
               id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
               source, target
             });
          }
        }
      });
      if (newTerms.length > 0) setGlossary(prev => [...prev, ...newTerms]);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const toggleTab = (tab: 'relations' | 'glossary') => {
    setActiveTab(activeTab === tab ? 'none' : tab);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 text-gray-900 font-sans overflow-hidden">
      
      {/* 1. Slim App Header */}
      <header className="flex-none bg-white border-b border-gray-200 z-20 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center text-white font-bold shadow-md shadow-brand-200">
            LN
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">Pro Translator</h1>
            <p className="text-[10px] text-gray-400 font-medium">Gemini 2.5 Pro Engine</p>
          </div>
        </div>

        {/* View Mode Toggles - Compact Segmented Control */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode(ViewMode.Split)} 
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === ViewMode.Split ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Split
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.Focus)} 
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === ViewMode.Focus ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Focus
          </button>
        </div>
      </header>

      {/* 2. Control Toolbar (Context & Actions) */}
      <div className="flex-none bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto">
        
        {/* Left: Context Controls */}
        <div className="flex items-center gap-3">

          {/* Model Selector */}
          <div className="relative">
             <select
                value={model}
                onChange={(e) => setModel(e.target.value as ModelType)}
                className="appearance-none bg-gray-50 border border-gray-200 text-brand-700 text-xs font-bold rounded-md py-1.5 pl-3 pr-8 hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors cursor-pointer min-w-[140px]"
              >
                <option value="gemini-2.5-flash">Model: Flash 2.5 ⚡</option>
                <option value="gemini-2.5-pro">Model: Pro 2.5 🧠</option>
                <option value="gemini-3-pro-preview">Model: Pro 3.0 🚀</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
          </div>

          <div className="h-4 w-px bg-gray-200 mx-1"></div>

          {/* Style Selector */}
          <div className="relative">
             <select
                value={style}
                onChange={(e) => setStyle(e.target.value as TranslationStyle)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-md py-1.5 pl-3 pr-8 hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors cursor-pointer min-w-[140px]"
              >
                <option value="default">Style: Auto</option>
                <option value="fantasy">✨ Fantasy</option>
                <option value="slice_of_life">☕ Slice of Life</option>
                <option value="action">⚔️ Action</option>
                <option value="mystery">🕵️ Mystery</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
          </div>

          <div className="h-4 w-px bg-gray-200 mx-1"></div>

          {/* Relationships Toggle */}
          <button 
            onClick={() => toggleTab('relations')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              activeTab === 'relations' 
              ? 'bg-brand-50 border-brand-200 text-brand-700' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Relations
            {relationships.length > 0 && <span className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full text-[9px]">{relationships.length}</span>}
          </button>

          {/* Glossary Toggle */}
          <button 
            onClick={() => toggleTab('glossary')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              activeTab === 'glossary' 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Dictionary
            {glossary.length > 0 && <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-[9px]">{glossary.length}</span>}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
           {!inputText && (
              <button onClick={handleLoadExample} className="text-xs text-brand-600 hover:text-brand-800 underline mr-2">
                Load Example
              </button>
            )}
           <Button variant="ghost" size="sm" onClick={handleClear} disabled={isLoading || (!inputText && !outputText)}>
            Clear
          </Button>
          <Button 
            onClick={handleTranslate} 
            isLoading={isLoading} 
            disabled={!inputText}
            size="sm"
            className="min-w-[100px]"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            }
          >
            Translate
          </Button>
        </div>
      </div>

      {/* 3. Sliding Context Panel (Relations / Glossary) */}
      <div className={`flex-none bg-gray-50 border-b border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${activeTab !== 'none' ? 'max-h-[300px]' : 'max-h-0'}`}>
        <div className="p-4 overflow-y-auto max-h-[300px]">
          
          {/* Relations Panel Content */}
          {activeTab === 'relations' && (
             <div className="max-w-4xl mx-auto">
               <div className="flex items-center justify-between mb-3">
                 <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Character Relationships</h3>
                 <div className="flex items-center gap-2">
                    <input type="file" ref={relationshipFileInputRef} onChange={handleRelationshipFileUpload} className="hidden" accept=".txt" />
                    <button onClick={() => relationshipFileInputRef.current?.click()} className="text-[10px] text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline">
                       <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                       Import .txt
                    </button>
                 </div>
               </div>

               {/* Instruction Block */}
               <div className="bg-brand-50/50 border border-brand-100 rounded-md p-2.5 mb-3 text-xs text-brand-800">
                  <p className="font-semibold mb-1">How to import via .txt file:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-brand-700/80">
                    <li>Format: <code className="bg-white px-1 py-0.5 rounded border border-brand-200 text-brand-900 font-mono text-[10px]">Subject, Relation, Target</code> (one per line)</li>
                    <li>Example: <span className="italic">Elara, older sister, Kael</span></li>
                    <li>Separators: Comma (,) or Pipe (|) are accepted.</li>
                  </ul>
               </div>

               <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Subject (A)" value={newRelSource} onChange={(e) => setNewRelSource(e.target.value)} className="flex-1 rounded border-gray-300 text-xs py-1.5 px-2 focus:ring-1 focus:ring-brand-500" />
                  <span className="text-gray-400 self-center text-xs">is</span>
                  <input type="text" placeholder="Relation" value={newRelRelation} onChange={(e) => setNewRelRelation(e.target.value)} className="flex-1 rounded border-gray-300 text-xs py-1.5 px-2 focus:ring-1 focus:ring-brand-500" />
                  <span className="text-gray-400 self-center text-xs">of</span>
                  <input type="text" placeholder="Target (B)" value={newRelTarget} onChange={(e) => setNewRelTarget(e.target.value)} className="flex-1 rounded border-gray-300 text-xs py-1.5 px-2 focus:ring-1 focus:ring-brand-500" />
                  <button onClick={addRelationship} disabled={!newRelSource || !newRelRelation || !newRelTarget} className="bg-brand-600 text-white rounded px-3 py-1 text-xs font-medium hover:bg-brand-700 disabled:opacity-50">Add</button>
               </div>

               {relationships.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                   {relationships.map(rel => (
                     <div key={rel.id} className="bg-white border border-gray-200 rounded px-2 py-1.5 flex items-center justify-between group">
                       <div className="text-xs truncate text-gray-700">
                         <span className="font-semibold text-brand-700">{rel.source}</span>
                         <span className="text-gray-400 mx-1">→</span>
                         <span className="italic">{rel.relation}</span>
                         <span className="text-gray-400 mx-1">→</span>
                         <span className="font-semibold text-brand-700">{rel.target}</span>
                       </div>
                       <button onClick={() => removeRelationship(rel.id)} className="text-gray-300 hover:text-red-500 ml-2"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}

          {/* Glossary Panel Content */}
          {activeTab === 'glossary' && (
             <div className="max-w-4xl mx-auto">
               <div className="flex items-center justify-between mb-3">
                 <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Dictionary Replacement</h3>
                 <div className="flex items-center gap-2">
                    <input type="file" ref={glossaryFileInputRef} onChange={handleGlossaryFileUpload} className="hidden" accept=".txt" />
                    <button onClick={() => glossaryFileInputRef.current?.click()} className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline">
                       <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                       Import .txt
                    </button>
                 </div>
               </div>

               <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Original Term" value={newTermSource} onChange={(e) => setNewTermSource(e.target.value)} className="flex-1 rounded border-gray-300 text-xs py-1.5 px-2 focus:ring-1 focus:ring-indigo-500" />
                  <span className="text-gray-400 self-center text-xs">=</span>
                  <input type="text" placeholder="Vietnamese Replacement" value={newTermTarget} onChange={(e) => setNewTermTarget(e.target.value)} className="flex-1 rounded border-gray-300 text-xs py-1.5 px-2 focus:ring-1 focus:ring-indigo-500" />
                  <button onClick={addGlossaryTerm} disabled={!newTermSource || !newTermTarget} className="bg-indigo-600 text-white rounded px-3 py-1 text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">Add</button>
               </div>

               {glossary.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                   {glossary.map(term => (
                     <div key={term.id} className="bg-white border border-gray-200 rounded px-2 py-1.5 flex items-center justify-between group">
                       <div className="text-xs truncate text-gray-700">
                         <span className="font-semibold">{term.source}</span>
                         <span className="text-gray-400 mx-1">=</span>
                         <span className="font-semibold text-indigo-700">{term.target}</span>
                       </div>
                       <button onClick={() => removeGlossaryTerm(term.id)} className="text-gray-300 hover:text-red-500 ml-2"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}

        </div>
      </div>

      {/* 4. Main Editor Grid (Fills remaining height) */}
      <main className="flex-grow overflow-hidden relative p-4">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-red-50 text-red-700 px-4 py-2 rounded-full shadow-lg border border-red-200 text-xs font-medium flex items-center animate-in fade-in slide-in-from-top-2">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <div className={`h-full grid gap-4 transition-all duration-300 ${viewMode === ViewMode.Split ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
          {/* Input Source */}
          <div className={`h-full flex flex-col transition-all duration-300 ${viewMode === ViewMode.Focus ? 'hidden' : ''}`}>
             <EditorPane 
              label="Source Text" 
              value={inputText} 
              onChange={setInputText}
              placeholder="Paste your source text here..."
              isHtml={true}
              className="h-full"
             />
          </div>

          {/* Output Translation */}
          <div className="h-full flex flex-col">
            <EditorPane 
              label="Translation" 
              value={outputText} 
              readOnly
              placeholder={isLoading ? "Translating..." : "Translation will appear here..."}
              isHtml={true}
              className={`h-full ${isLoading ? 'animate-pulse' : ''}`}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;