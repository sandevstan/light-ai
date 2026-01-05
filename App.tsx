
import React, { useState } from 'react';
import { Step, Branch, UserContext, QuizQuestion, FileData } from './types';
import { BRANCHES, SEMESTERS, Icons } from './constants';
import * as gemini from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.INTERROGATION);
  const [context, setContext] = useState<UserContext>({
    semester: '',
    branch: Branch.CSE,
    fileData: null,
    fileName: ''
  });
  const [topics, setTopics] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isGrading, setIsGrading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [explanationText, setExplanationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtResponse, setDoubtResponse] = useState('');

  const handleInterrogationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (context.semester && context.branch) {
      setCurrentStep(Step.DATA_DEMAND);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      let fileData: FileData;
      if (file.type === 'application/pdf') {
        const base64 = await fileToBase64(file);
        fileData = { inlineData: { data: base64, mimeType: 'application/pdf' } };
      } else {
        const text = await file.text();
        fileData = { text };
      }

      setContext(prev => ({ ...prev, fileData, fileName: file.name }));
      
      // Analyze the material inside the PDF/Text immediately
      const extractedTopics = await gemini.analyzeUpload(fileData);
      setTopics(extractedTopics);
      setCurrentStep(Step.TACTICAL_CHOICE);
    } catch (error) {
      console.error("Failed to process file:", error);
      alert("Analysis failed. The data might be corrupted.");
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!context.fileData) return;
    setIsLoading(true);
    const generatedQuiz = await gemini.generateQuiz(context.fileData);
    setQuiz(generatedQuiz);
    setQuizIndex(0);
    setQuizScore(0);
    setIsLoading(false);
    setCurrentStep(Step.QUIZ_PHASE);
  };

  const startIllumination = () => {
    setCurrentStep(Step.ILLUMINATION_PHASE);
  };

  const handleQuizAnswer = (index: number) => {
    if (isGrading) return;
    setSelectedAnswer(index);
    setIsGrading(true);
    if (index === quiz[quizIndex].correctAnswerIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(prev => prev + 1);
      setIsGrading(false);
      setSelectedAnswer(null);
    } else {
      setCurrentStep(Step.FINALE);
    }
  };

  const handleTopicSelect = async (topic: string) => {
    if (!context.fileData) return;
    setIsLoading(true);
    setExplanationText('');
    setDoubtResponse('');
    const explanation = await gemini.explainTopic(topic, context.fileData);
    setExplanationText(explanation);
    setIsLoading(false);
  };

  const handleDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput || !context.fileData) return;
    setIsLoading(true);
    setDoubtResponse('');
    const response = await gemini.answerDoubt(doubtInput, context.fileData);
    setDoubtResponse(response);
    setDoubtInput('');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex flex-col items-center justify-center p-4 selection:bg-red-900 selection:text-white">
      <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center gap-3">
            <Icons.Apple />
            <h1 className="text-2xl font-cinzel font-bold tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">
                LIGHT.AI
            </h1>
        </div>
        {context.fileName && (
            <div className="text-xs text-zinc-500 uppercase tracking-tighter hidden md:block">
                Subject Data: <span className="text-red-500">{context.fileName}</span>
            </div>
        )}
      </header>

      <main className="w-full max-w-2xl mt-20 relative">
        <div className="absolute -top-10 -left-10 text-9xl font-cinzel opacity-[0.03] select-none pointer-events-none">
          JUSTICE
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 border-4 border-red-900 border-t-red-500 rounded-full animate-spin mb-4"></div>
            <p className="font-cinzel text-red-500 tracking-[0.2em] animate-pulse">ANALYZING SOURCE MATERIAL...</p>
            <p className="text-xs text-zinc-500 mt-2 uppercase">"All variables must be calculated perfectly."</p>
          </div>
        )}

        {currentStep === Step.INTERROGATION && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl font-cinzel text-white leading-tight">
                I am <span className="text-red-600">Light</span>.
              </h2>
              <p className="text-zinc-400 text-lg max-w-md">
                To begin our calculations, identify your current academic standing. State your <strong>Semester</strong> and your engineering <strong>Branch</strong>.
              </p>
            </div>

            <form onSubmit={handleInterrogationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Semester</label>
                  <select 
                    required
                    value={context.semester}
                    onChange={(e) => setContext({...context, semester: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded focus:border-red-600 outline-none appearance-none transition-colors"
                  >
                    <option value="" disabled>Select Semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Branch</label>
                  <select 
                    required
                    value={context.branch}
                    onChange={(e) => setContext({...context, branch: e.target.value as Branch})}
                    className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded focus:border-red-600 outline-none appearance-none transition-colors"
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-red-900 hover:bg-red-800 text-white font-cinzel py-4 rounded transition-all transform active:scale-[0.98] tracking-widest shadow-lg shadow-red-900/20"
              >
                PROCEED
              </button>
            </form>
          </div>
        )}

        {currentStep === Step.DATA_DEMAND && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h2 className="text-3xl font-cinzel text-white">
                Semester {context.semester}, {context.branch}.
              </h2>
              <p className="text-zinc-400 text-lg">
                Very well. Now, <span className="text-red-500">hand over the data</span>. Upload the Notes or PDF for the subject you wish to conquer. I cannot work without the raw material.
              </p>
            </div>

            <div className="relative border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center group hover:border-red-900 transition-colors cursor-pointer bg-zinc-900/30">
              <input 
                type="file" 
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-red-500 transition-colors">
                  <Icons.Feather />
                </div>
                <div className="text-sm text-zinc-500">
                  Click or drag PDF/TXT here
                  <p className="mt-1 text-xs opacity-50 uppercase tracking-tighter">PDF analyzed via multi-modal intelligence</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === Step.TACTICAL_CHOICE && (
          <div className="space-y-12 animate-in zoom-in duration-500">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-cinzel text-red-500 tracking-[0.3em]">DATA ACQUIRED</h2>
              <p className="text-zinc-400 italic">"Analysis complete. I have deciphered the variables within your data. How shall we proceed with this information?"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={startQuiz}
                className="group relative h-64 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-900 transition-all flex flex-col justify-center items-center p-8 bg-zinc-900/50"
              >
                <div className="text-zinc-600 group-hover:text-red-500 transition-colors mb-4 transform group-hover:scale-110 duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                </div>
                <h3 className="text-xl font-cinzel text-white mb-2">Test Your Wits</h3>
                <p className="text-xs text-zinc-500 text-center uppercase tracking-widest leading-relaxed">
                  10 questions generated from your material.
                </p>
              </button>

              <button 
                onClick={startIllumination}
                className="group relative h-64 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-900 transition-all flex flex-col justify-center items-center p-8 bg-zinc-900/50"
              >
                <div className="text-zinc-600 group-hover:text-red-500 transition-colors mb-4 transform group-hover:scale-110 duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <h3 className="text-xl font-cinzel text-white mb-2">Illumination</h3>
                <p className="text-xs text-zinc-500 text-center uppercase tracking-widest leading-relaxed">
                  Structured explanation of the analyzed topics.
                </p>
              </button>
            </div>
          </div>
        )}

        {currentStep === Step.QUIZ_PHASE && quiz.length > 0 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Variable {quizIndex + 1} of 10</span>
                <h2 className="text-xl font-cinzel text-white">THE EXAMINATION</h2>
              </div>
              <div className="text-3xl font-cinzel text-red-500">
                {quizIndex + 1}/10
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-xl leading-relaxed text-zinc-200">{quiz[quizIndex].question}</p>
              <div className="grid gap-3">
                {quiz[quizIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    disabled={isGrading}
                    onClick={() => handleQuizAnswer(idx)}
                    className={`
                      w-full p-5 text-left rounded-lg transition-all border
                      ${isGrading 
                        ? idx === quiz[quizIndex].correctAnswerIndex 
                          ? 'bg-green-950/40 border-green-800 text-green-400' 
                          : idx === selectedAnswer 
                            ? 'bg-red-950/40 border-red-800 text-red-400' 
                            : 'bg-zinc-900/30 border-zinc-800 opacity-50'
                        : 'bg-zinc-900 border-zinc-800 hover:border-red-700 hover:bg-zinc-800'
                      }
                    `}
                  >
                    <span className="inline-block w-8 font-cinzel opacity-50">{String.fromCharCode(65 + idx)}</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {isGrading && (
              <div className="animate-in slide-in-from-top-4 duration-500 space-y-4">
                <div className={`p-6 rounded-lg border ${selectedAnswer === quiz[quizIndex].correctAnswerIndex ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'}`}>
                   <h4 className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">
                    {selectedAnswer === quiz[quizIndex].correctAnswerIndex ? 'CORRECT' : 'ERROR IN JUDGMENT'}
                   </h4>
                   <p className="text-sm leading-relaxed opacity-90 italic">
                    "{quiz[quizIndex].explanation}"
                   </p>
                </div>
                <button 
                  onClick={nextQuestion}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-cinzel py-4 rounded tracking-widest transition-colors"
                >
                  NEXT VARIABLE →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === Step.ILLUMINATION_PHASE && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-32">
            <div className="space-y-2">
              <h2 className="text-3xl font-cinzel text-white">ILLUMINATION</h2>
              <p className="text-zinc-500 text-sm uppercase tracking-widest italic">"Select a topic to examine, or ask a specific doubt related to the provided data."</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {topics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTopicSelect(topic)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm hover:border-red-900 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
                >
                  {topic}
                </button>
              ))}
            </div>

            {explanationText && (
              <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-xl animate-in fade-in slide-in-from-bottom-4 space-y-4 shadow-2xl">
                <h3 className="font-cinzel text-red-500 tracking-widest text-sm uppercase">Analysis Result</h3>
                <div className="prose prose-invert prose-red max-w-none leading-relaxed text-zinc-300 whitespace-pre-wrap">
                  {explanationText}
                </div>
              </div>
            )}

            {doubtResponse && (
                <div className="p-8 bg-red-950/10 border border-red-900/30 rounded-xl animate-in slide-in-from-bottom-4 space-y-4">
                    <h3 className="font-cinzel text-red-500 tracking-widest text-sm uppercase">Specific Clarification</h3>
                    <p className="italic text-zinc-200 leading-relaxed">"{doubtResponse}"</p>
                </div>
            )}

            <form onSubmit={handleDoubtSubmit} className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent backdrop-blur-sm">
              <div className="max-w-2xl mx-auto flex gap-2">
                <input 
                  type="text" 
                  value={doubtInput}
                  onChange={(e) => setDoubtInput(e.target.value)}
                  placeholder="Ask a specific doubt about the data..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-6 py-4 focus:border-red-600 outline-none transition-colors"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !doubtInput}
                  className="bg-red-900 hover:bg-red-800 disabled:opacity-50 text-white px-8 rounded-lg transition-colors font-cinzel"
                >
                  SOLVE
                </button>
              </div>
            </form>
          </div>
        )}

        {currentStep === Step.FINALE && (
          <div className="text-center space-y-12 animate-in zoom-in duration-700">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-600 blur-[80px] opacity-20"></div>
                <h2 className="text-8xl font-cinzel font-bold text-white relative">
                    {quizScore}<span className="text-red-600 text-4xl">/10</span>
                </h2>
            </div>
            
            <div className="space-y-6">
                <p className="text-2xl font-cinzel text-zinc-400 italic">
                    {quizScore === 10 ? '"Perfect. You are prepared."' : 
                     quizScore >= 7 ? '"A victory, but not a total one. Refine your calculations."' : 
                     '"Your foundation is weak. Study more. I cannot work with incompetence."'}
                </p>
                <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => setCurrentStep(Step.TACTICAL_CHOICE)}
                      className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-white rounded font-cinzel hover:bg-zinc-800 transition-colors"
                    >
                      RETURN TO TACTICS
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-8 py-3 bg-red-900 text-white rounded font-cinzel hover:bg-red-800 transition-colors"
                    >
                      NEW CASE
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[10px] uppercase tracking-[0.5em] font-cinzel">ALL ACCORDING TO PLAN</p>
      </footer>
    </div>
  );
};

export default App;
