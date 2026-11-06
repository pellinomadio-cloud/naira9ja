import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { quizQuestions, QuizQuestion } from './quizQuestions';
import { useAppSettings } from '../appSettings';

interface TaskPageProps {
  user: User;
  onTelegramClaim: () => void;
  onGameResult: (win: boolean) => void;
  onBack: () => void;
  mode?: 'quiz' | 'telegram' | 'all';
}

const TaskPage: React.FC<TaskPageProps> = ({ user, onTelegramClaim, onGameResult, onBack, mode = 'all' }) => {
  const settings = useAppSettings();
  const [gameStep, setGameStep] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isWin, setIsWin] = useState(false);

  const startGame = () => {
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    setCurrentQuestion(quizQuestions[randomIndex]);
    setGameStep('playing');
    setSelectedOption(null);
  };

  const handleAnswer = (option: string) => {
    if (!currentQuestion) return;
    
    setSelectedOption(option);
    const win = option === currentQuestion.answer;
    setIsWin(win);
    
    setTimeout(() => {
      setGameStep('result');
      onGameResult(win);
    }, 500);
  };

  const getEffectiveQuizCount = () => {
    const now = new Date();
    const lastQuiz = user.lastQuizTimestamp ? new Date(user.lastQuizTimestamp) : null;
    if (!lastQuiz || now.toDateString() !== lastQuiz.toDateString()) {
      return 0;
    }
    return user.dailyQuizCount || 0;
  };

  const canPlayQuiz = () => {
    return getEffectiveQuizCount() < 20;
  };

  const canClaimTelegram = () => {
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastTelegramClaimTimestamp || 0;
    return nowTs - lastClaim >= twentyFourHours;
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center p-2.5 bg-black text-white rounded-2xl border border-blue-500/50 shadow-xs mb-1">
            {mode === 'quiz' ? <Icons.Gamepad2 size={24} className="text-blue-400" /> : <Icons.Star size={24} className="text-blue-400" />}
        </div>
        <h2 className="text-lg font-black text-slate-900">
            {mode === 'quiz' ? 'Daily Quiz Game' : mode === 'telegram' ? 'Daily Task' : 'Daily Tasks'}
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {mode === 'quiz' 
                ? 'Answer questions correctly to earn Real Cash rewards.' 
                : mode === 'telegram' 
                    ? 'Join our official channel and earn daily member rewards.' 
                    : 'Complete simple tasks and play quizzes to earn rewards.'}
        </p>
      </div>

      {/* Telegram Task Section */}
      {(mode === 'telegram' || mode === 'all') && (
      <div className="bg-white rounded-3xl p-4 shadow-sm shadow-pink-500/5 border border-pink-200 space-y-3">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <Icons.Send size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-900">Join Telegram Channel</h3>
                <p className="text-[10px] text-slate-500">Earn ₦2,000 daily reward for membership.</p>
            </div>
            {canClaimTelegram() ? (
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase border border-emerald-200">Available</span>
            ) : (
                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">Claimed</span>
            )}
        </div>

        <div className="space-y-2 pt-1">
            <button 
                onClick={() => {
                    window.open(settings.telegramLink || 'https://t.me/naira9ja001', '_blank');
                    onTelegramClaim();
                }}
                disabled={!canClaimTelegram()}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-95 uppercase tracking-wider ${
                  canClaimTelegram() 
                    ? 'bg-black hover:bg-slate-900 text-white border border-blue-500/50 shadow-[0_2px_10px_rgba(37,99,235,0.25)]' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
                <Icons.Send size={15} className="text-blue-400" />
                <span>{canClaimTelegram() ? 'Join & Claim ₦2,000' : 'Already Claimed Today'}</span>
            </button>
        </div>
      </div>
      )}

      {/* Quiz Game Section */}
      {(mode === 'quiz' || mode === 'all') && (
      <div className="bg-white rounded-3xl p-4 shadow-sm shadow-pink-500/5 border border-pink-200 space-y-3">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-100 border border-pink-200 rounded-2xl flex items-center justify-center text-pink-600 shrink-0">
                <Icons.Gamepad2 size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-900">Daily Quiz Game</h3>
                <p className="text-[10px] text-slate-500">Win ₦7,000 if correct, lose ₦1,000 if wrong.</p>
            </div>
        </div>

        {gameStep === 'intro' && (
            <div className="text-center py-2 space-y-3">
                <p className="text-xs text-slate-600">
                    {canPlayQuiz() 
                        ? 'Test your general knowledge and earn cash!' 
                        : 'Daily limit of 20 questions reached. Come back tomorrow!'}
                </p>
                <div className="flex justify-between items-center px-1 text-[10px] text-slate-500 font-medium">
                    <span>Daily Progress</span>
                    <span>{getEffectiveQuizCount()}/20</span>
                </div>
                <div className="w-full bg-pink-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className="bg-blue-600 h-full transition-all duration-500" 
                        style={{ width: `${Math.min((getEffectiveQuizCount() / 20) * 100, 100)}%` }}
                    />
                </div>
                <button 
                    onClick={startGame}
                    disabled={!canPlayQuiz()}
                    className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 uppercase tracking-wider ${
                        canPlayQuiz() 
                            ? 'bg-black hover:bg-slate-900 text-white border border-blue-500/50 shadow-[0_2px_10px_rgba(37,99,235,0.25)]' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {canPlayQuiz() ? 'Start Quiz' : 'Limit Reached'}
                </button>
            </div>
        )}

        {gameStep === 'playing' && currentQuestion && (
            <div className="space-y-4 py-1">
                <div className="bg-pink-50/70 p-3.5 rounded-2xl border border-pink-200">
                    <p className="text-slate-900 font-bold text-sm text-center">{currentQuestion.question}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            disabled={selectedOption !== null}
                            className={`w-full py-2.5 px-3.5 text-left rounded-xl text-xs font-semibold transition-all transform active:scale-[0.99] border ${
                                selectedOption === option 
                                    ? (option === currentQuestion.answer ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800')
                                    : 'bg-white border-pink-200 text-slate-800 hover:border-blue-500 hover:bg-pink-50/40 shadow-2xs'
                            }`}
                        >
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-pink-100 text-[10px] font-bold text-slate-700 mr-2.5 border border-pink-200">
                                {String.fromCharCode(65 + idx)}
                            </span>
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {gameStep === 'result' && (
            <div className="text-center py-2 space-y-3 animate-in zoom-in-95 duration-300">
                <div className={`text-xl font-black ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isWin ? 'CORRECT! 🎉' : 'WRONG! 😢'}
                </div>
                <p className="text-xs text-slate-600">
                    {isWin ? `₦7,000 has been credited to your balance.` : `₦1,000 has been deducted from your balance.`}
                </p>
                <div className="flex justify-between items-center px-1 text-[10px] text-slate-500 font-medium">
                    <span>Daily Progress</span>
                    <span>{getEffectiveQuizCount()}/20</span>
                </div>
                <button 
                    onClick={startGame}
                    disabled={!canPlayQuiz()}
                    className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 uppercase tracking-wider ${
                        canPlayQuiz() 
                            ? 'bg-black hover:bg-slate-900 text-white border border-blue-500/50 shadow-[0_2px_10px_rgba(37,99,235,0.25)]' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {canPlayQuiz() ? 'Next Question' : 'Daily Limit Reached'}
                </button>
            </div>
        )}
      </div>
      )}

      <button onClick={onBack} className="w-full py-2 text-slate-500 font-medium hover:text-slate-900 text-xs text-center">
        Back to Dashboard
      </button>

    </div>
  );
};

export default TaskPage;
