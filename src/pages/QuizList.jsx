import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, Play } from 'lucide-react';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const [quizzesRes, attemptsRes] = await Promise.all([
          axios.get('/api/quizzes'),
          axios.get('/api/quizzes/attempts/my').catch(() => ({ data: { attempts: [] } }))
        ]);
        setQuizzes(quizzesRes.data.quizzes || []);
        setAttempts(attemptsRes.data.attempts || []);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 w-48 rounded mb-6"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-outfit font-extrabold text-3xl dark:text-white mb-2">Available Quizzes</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Choose a topic, check the duration, and start taking tests</p>

      {quizzes.length === 0 ? (
        <div className="text-center py-12 nm-card rounded-2xl">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Quizzes Available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check back later for newly published tests.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const quizAttempt = attempts.find(a => (a.quizId?._id || a.quizId) === quiz._id);
            const hasAttempted = !!quizAttempt;

            return (
              <div key={quiz._id} className="nm-card p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 nm-inset-sm px-2.5 py-1 rounded">
                    {quiz.category}
                  </span>
                  <h3 className="font-outfit font-bold text-xl text-slate-900 dark:text-white mt-3 leading-snug">{quiz.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">{quiz.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{quiz.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      <span>{quiz.totalMarks} marks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    quiz.difficulty === 'easy' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                    quiz.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                    'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                  }`}>
                    {quiz.difficulty}
                  </span>

                  {hasAttempted ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-650 dark:text-emerald-400 nm-inset-sm px-2.5 py-1.5 rounded-lg">
                      Score: {quizAttempt.score}/{quiz.totalMarks}
                    </span>
                  ) : (
                    <Link
                      to={`/quizzes/${quiz._id}/attempt`}
                      className="inline-flex items-center gap-1 nm-btn-primary font-semibold text-xs px-3 py-2 rounded-lg"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Start Test</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
