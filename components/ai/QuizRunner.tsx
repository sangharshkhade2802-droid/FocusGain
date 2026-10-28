'use client';

import React, { useState } from 'react';
import { QuizPayload, QuizQuestion } from '@/app/api/ai/generate-quiz/route';
import { QuizAnalysisResult } from '@/app/api/ai/analyze-quiz/route';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, RefreshCw, Trophy, BookOpen, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizRunnerProps {
  quiz: QuizPayload;
  taskName: string;
  onClose: () => void;
  onSaveQuizResult?: (result: QuizAnalysisResult) => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quiz,
  taskName,
  onClose,
  onSaveQuizResult,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<QuizAnalysisResult | null>(null);

  const currentQuestion: QuizQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsAnalyzing(true);
    try {
      const storedKey = typeof window !== 'undefined' ? localStorage.getItem('focusgain_gemini_key') || '' : '';
      const res = await fetch('/api/ai/analyze-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedKey ? { 'x-gemini-api-key': storedKey } : {}),
        },
        body: JSON.stringify({
          taskName,
          questions: quiz.questions,
          userAnswers: selectedAnswers,
          userApiKey: storedKey || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        setIsSubmitted(true);
        if (data.analysis.score >= 70) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
        if (onSaveQuizResult) {
          onSaveQuizResult(data.analysis);
        }
      }
    } catch (err) {
      console.error('Quiz analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel p-6 md:p-8 border border-white/10 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                20-MCQ DIAGNOSTIC
              </span>
              <span className="text-xs text-slate-400">Powered by Gemini AI</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white mt-1">
              {quiz.quizTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {!isSubmitted ? (
          <div>
            {/* Progress Bar & Question Info */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              <span>
                Progress: <strong className="text-indigo-400">{answeredCount}/{totalQuestions}</strong> answered
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>

            {/* Question Details */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {currentQuestion.subtopic}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    currentQuestion.difficulty === 'Easy'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : currentQuestion.difficulty === 'Medium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg glow-primary'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20 hover:bg-slate-900'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation & Submit Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-white/5 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={isAnalyzing}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all glow-emerald disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Diagnostics...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4" /> Complete & Generate Diagnostic
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Diagnostic Report Screen */
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 mx-auto flex items-center justify-center text-3xl mb-3">
                🏆
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                Diagnostic Complete: {analysisResult?.score}%
              </h3>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                {analysisResult?.executiveSummary}
              </p>
              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                <span>
                  Correct Answers: <strong className="text-emerald-400">{analysisResult?.correctAnswers} / {analysisResult?.totalQuestions}</strong>
                </span>
                <span>
                  Mastery Tier: <strong className="text-indigo-400">
                    {(analysisResult?.score ?? 0) >= 80 ? 'Master' : (analysisResult?.score ?? 0) >= 60 ? 'Competent' : 'Developing'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Weak vs Strong Knowledge Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Strong Knowledge Areas
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult?.strongAreas.map((area, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Targeted Weak Areas
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult?.weakAreas.map((area, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Targeted Content Recommendations */}
            {analysisResult?.contentRecommendations && analysisResult.contentRecommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Curated AI Learning Resources for Weak Areas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.contentRecommendations.map((rec, i) => (
                    <a
                      key={i}
                      href={rec.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            {rec.type}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">
                          {rec.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
