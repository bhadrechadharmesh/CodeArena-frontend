import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WebcamMonitor from '../components/WebcamMonitor.jsx';
import { Clock, CheckSquare, ArrowLeft, ArrowRight, HelpCircle, Save, AlertTriangle } from 'lucide-react';

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [reviewed, setReviewed] = useState([]); // Marked for review indexes
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  
  const timerRef = useRef(null);

  // Fetch Quiz Questions
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/quizzes/${id}`);
        const fetchedQuiz = res.data.quiz;
        setQuiz(fetchedQuiz);
        setTimeLeft(fetchedQuiz.duration * 60);

        // Initialize answers state structure
        const initialAnswers = fetchedQuiz.questions.map((q) => ({
          questionId: q._id,
          selectedOption: null,
          selectedOptions: [],
          booleanAnswer: null,
          textAnswer: ''
        }));
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Failed to load quiz details:', err.message);
        alert('Failed to load quiz questions.');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  // Timer countdown and Auto-submit
  useEffect(() => {
    if (loading || !quiz || timeLeft <= 0) {
      if (timeLeft === 0 && quiz) {
        handleAutoSubmit();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, quiz, timeLeft]);

  const handleAutoSubmit = () => {
    alert('TIMEOUT: Quiz duration elapsed. Auto-submitting details...');
    handleSubmitQuiz();
  };

  const handleOptionChange = (qIdx, optIdx) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[qIdx].selectedOption = optIdx;
      return updated;
    });
  };

  const handleCheckboxChange = (qIdx, optIdx) => {
    setAnswers((prev) => {
      const updated = [...prev];
      const selected = updated[qIdx].selectedOptions || [];
      if (selected.includes(optIdx)) {
        updated[qIdx].selectedOptions = selected.filter((item) => item !== optIdx);
      } else {
        updated[qIdx].selectedOptions = [...selected, optIdx];
      }
      return updated;
    });
  };

  const handleBooleanChange = (qIdx, val) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[qIdx].booleanAnswer = val;
      return updated;
    });
  };

  const handleTextChange = (qIdx, val) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[qIdx].textAnswer = val;
      return updated;
    });
  };

  const toggleReview = (qIdx) => {
    setReviewed((prev) =>
      prev.includes(qIdx) ? prev.filter((item) => item !== qIdx) : [...prev, qIdx]
    );
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const elapsedSeconds = (quiz.duration * 60) - timeLeft;
      const res = await axios.post(`/api/quizzes/${id}/attempt`, {
        answers,
        timeTaken: elapsedSeconds
      });
      setSubmittedResult(res.data.attempt);
    } catch (err) {
      alert('Failed to submit attempt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit on 3 violations
  useEffect(() => {
    if (violationCount >= 3) {
      alert('EXAM TERMINATED: You have exceeded the maximum of 3 proctoring violations. Your quiz is being submitted automatically.');
      handleSubmitQuiz();
    }
  }, [violationCount]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse text-center">
        <Clock className="h-10 w-10 text-slate-300 mx-auto animate-spin mb-2" />
        <span className="text-slate-400">Loading quiz environment...</span>
      </div>
    );
  }

  // Display results screen after submission
  if (submittedResult) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="glass-card p-8 rounded-3xl shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-8 w-8" />
          </div>
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">Exam Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Your grading report is ready.</p>

          <div className="grid grid-cols-2 gap-4 my-8 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="text-center">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Score</span>
              <span className="font-outfit font-bold text-2xl text-slate-900 dark:text-white mt-1 block">{submittedResult.score} pts</span>
            </div>
            <div className="text-center">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Accuracy</span>
              <span className="font-outfit font-bold text-2xl text-emerald-600 dark:text-emerald-400 mt-1 block">{submittedResult.accuracy}%</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="flex-grow bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors text-sm"
            >
              Go to Dashboard
            </button>
            <button
              onClick={async () => {
                const response = await axios.get(`/api/quizzes/attempts/${submittedResult.id}/pdf`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `scorecard_${quiz.title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
              }}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIdx];
  const currentAns = answers[currentIdx];

  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Proctoring Camera Feed */}
      <WebcamMonitor 
        quizId={id} 
        onViolationLog={() => setViolationCount((prev) => prev + 1)} 
      />

      {/* Header bar with Timer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider">Exam Panel</span>
          <h1 className="font-outfit font-extrabold text-2xl dark:text-white leading-none mt-1">{quiz.title}</h1>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${
          timeLeft < 120 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse-slow' : 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-slate-800 dark:text-brand-400 dark:border-slate-700'
        }`}>
          <Clock className="h-4 w-4" />
          <span>Timer: {min}m {sec.toString().padStart(2, '0')}s</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Question Grid</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-2">
            {quiz.questions.map((_, index) => {
              const isSelected = index === currentIdx;
              const hasAns = answers[index] && (
                answers[index].selectedOption !== null ||
                answers[index].selectedOptions.length > 0 ||
                answers[index].booleanAnswer !== null ||
                answers[index].textAnswer.trim() !== ''
              );
              const isReview = reviewed.includes(index);

              return (
                <button
                  key={index}
                  onClick={() => setCurrentIdx(index)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                    isSelected ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900 border-brand-500 bg-brand-500 text-white' :
                    isReview ? 'bg-amber-500 text-white border-amber-500' :
                    hasAns ? 'bg-emerald-500 text-white border-emerald-500' :
                    'bg-slate-50 border-slate-200 dark:bg-slate-700 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded"></span>
              <span>Attempted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded"></span>
              <span>For Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-100 border border-slate-200 dark:bg-slate-700 dark:border-slate-600 rounded"></span>
              <span>Unattempted</span>
            </div>
          </div>
        </div>

        {/* Question Panel */}
        <div className="md:col-span-3 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-400">
              <span className="uppercase">Question {currentIdx + 1} of {quiz.questions.length}</span>
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded uppercase">{currentQ.difficulty}</span>
            </div>

            <h3 className="font-outfit font-semibold text-lg text-slate-900 dark:text-white leading-relaxed mb-6">
              {currentQ.questionText}
            </h3>

            {/* Answer Selector Inputs based on type */}
            <div className="space-y-3">
              {/* MCQ */}
              {currentQ.questionType === 'mcq' && currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionChange(currentIdx, i)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                    currentAns.selectedOption === i ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-slate-700 dark:border-brand-500 dark:text-white' : 'bg-slate-50 hover:bg-slate-100/50 border-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:border-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span>{opt}</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentAns.selectedOption === i ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'}`}>
                    {currentAns.selectedOption === i && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                  </span>
                </button>
              ))}

              {/* Multiple Correct */}
              {currentQ.questionType === 'multiple_correct' && currentQ.options.map((opt, i) => {
                const isSelected = currentAns.selectedOptions?.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleCheckboxChange(currentIdx, i)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-slate-700 dark:border-brand-500 dark:text-white' : 'bg-slate-50 hover:bg-slate-100/50 border-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:border-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'}`}>
                      {isSelected && <span className="w-2 h-2 bg-white rounded-sm"></span>}
                    </span>
                  </button>
                );
              })}

              {/* True/False */}
              {currentQ.questionType === 'true_false' && (
                <div className="flex gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={val.toString()}
                      onClick={() => handleBooleanChange(currentIdx, val)}
                      className={`flex-grow py-4 rounded-xl border text-sm font-bold transition-all text-center ${
                        currentAns.booleanAnswer === val ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-slate-700 dark:border-brand-500 dark:text-white' : 'bg-slate-50 hover:bg-slate-100/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {val ? 'TRUE' : 'FALSE'}
                    </button>
                  ))}
                </div>
              )}

              {/* Fill in the blank */}
              {currentQ.questionType === 'fill_blank' && (
                <div>
                  <input
                    type="text"
                    value={currentAns.textAnswer}
                    onChange={(e) => handleTextChange(currentIdx, e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                    placeholder="Type your answer here..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>
              <button
                disabled={currentIdx === quiz.questions.length - 1}
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={() => toggleReview(currentIdx)}
              className={`font-semibold text-xs px-4 py-2.5 rounded-lg border transition-all ${
                reviewed.includes(currentIdx) ? 'bg-amber-500 border-amber-500 text-white' : 'border-amber-500 text-amber-500 hover:bg-amber-50'
              }`}
            >
              {reviewed.includes(currentIdx) ? 'Marked for Review' : 'Mark for Review'}
            </button>

            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Submit Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
