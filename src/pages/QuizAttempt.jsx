import { useSessionNavigation } from '../components/SessionNavigation.jsx';
import { exitFullscreen } from '../services/fullscreen.js';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WebcamMonitor from '../components/WebcamMonitor.jsx';
import CameraStartConfirmation from '../components/CameraStartConfirmation.jsx';
import { Clock, CheckSquare, ArrowLeft, ArrowRight, HelpCircle, Save, AlertTriangle, Download, Flag, Check, ChevronRight } from 'lucide-react';

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
  const [confirmed, setConfirmed] = useState(false);
  
  useSessionNavigation(confirmed && !submittedResult);

  const timerRef = useRef(null);
  const deadlineRef = useRef(null);
  const submissionRef = useRef(false);
  const autoSubmittedRef = useRef(false);
  const [submitReview, setSubmitReview] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');

  const fullscreenExitTimer = useRef(null);
  useEffect(() => {
    clearTimeout(fullscreenExitTimer.current);
    return () => {
      // Defer cleanup so React StrictMode's effect replay does not exit fullscreen.
      fullscreenExitTimer.current = setTimeout(() => { exitFullscreen(); }, 0);
    };
  }, []);

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

  // Use wall-clock time so a delayed interval cannot extend the assessment.
  useEffect(() => {
    if (!confirmed || !quiz || submittedResult) return;
    const tick = () => setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [confirmed, quiz, submittedResult]);

  useEffect(() => {
    if (confirmed && quiz && !submittedResult && (timeLeft === 0 || violationCount >= 3) && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      setNotice(timeLeft === 0 ? 'Time is up. Your answers are being submitted.' : 'The session ended after three proctoring events. Your answers are being submitted.');
      handleSubmitQuiz();
    }
  }, [timeLeft, confirmed, quiz, submittedResult, violationCount]);

  const handleOptionChange = (qIdx, optIdx) => {
    setAnswers((prev) =>
      prev.map((ans, idx) => (idx === qIdx ? { ...ans, selectedOption: optIdx } : ans))
    );
  };

  const handleCheckboxChange = (qIdx, optIdx) => {
    setAnswers((prev) =>
      prev.map((ans, idx) => {
        if (idx !== qIdx) return ans;
        const selected = ans.selectedOptions || [];
        const newSelected = selected.includes(optIdx)
          ? selected.filter((item) => item !== optIdx)
          : [...selected, optIdx];
        return { ...ans, selectedOptions: newSelected };
      })
    );
  };

  const handleBooleanChange = (qIdx, val) => {
    setAnswers((prev) =>
      prev.map((ans, idx) => (idx === qIdx ? { ...ans, booleanAnswer: val } : ans))
    );
  };

  const handleTextChange = (qIdx, val) => {
    setAnswers((prev) =>
      prev.map((ans, idx) => (idx === qIdx ? { ...ans, textAnswer: val } : ans))
    );
  };

  const toggleReview = (qIdx) => {
    setReviewed((prev) =>
      prev.includes(qIdx) ? prev.filter((item) => item !== qIdx) : [...prev, qIdx]
    );
  };

  const handleSubmitQuiz = async () => {
    if (submissionRef.current || submittedResult) return;
    submissionRef.current = true;
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const elapsedSeconds = Math.max(0, Math.min(quiz.duration * 60, Math.floor((Date.now() - (deadlineRef.current - quiz.duration * 60000)) / 1000)));
      const res = await axios.post(`/api/quizzes/${id}/attempt`, {
        answers,
        timeTaken: elapsedSeconds
      });
      setSubmittedResult(res.data.attempt);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Your answers could not be submitted. Please retry; your answers are still here.');
    } finally {
      submissionRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse text-center">
        <Clock className="h-10 w-10 text-slate-300 mx-auto animate-spin mb-2" />
        <span className="text-slate-400">Loading quiz environment...</span>
      </div>
    );
  }

  if (!quiz?.questions?.length) return <div className="live-empty"><h1>No questions available</h1><p>This assessment cannot be started yet.</p><button onClick={() => navigate('/quizzes')} className="button-secondary px-4 py-2">Back to quizzes</button></div>;

  if (!confirmed) {
    return (
      <CameraStartConfirmation requireFullscreen
        title={`Start Quiz: ${quiz?.title || 'Loading...'}`}
        subtitle={`Category: ${quiz?.category || '--'} | Duration: ${quiz?.duration || '--'} mins | Marks: ${quiz?.totalMarks || '--'}`}
        onConfirm={() => { deadlineRef.current = Date.now() + quiz.duration * 60000; setConfirmed(true); }}
        onCancel={() => navigate('/quizzes')}
      />
    );
  }

  // Display results screen after submission
  if (submittedResult) {
    return (
      <div className="live-result max-w-2xl mx-auto my-12 px-4">
        <div className="surface-card overflow-hidden">
          <div className="h-2 bg-[var(--accent)]" />
          <div className="p-8">
          <p className="font-mono text-[11px] uppercase tracking-[.16em] text-[var(--muted)] mb-4">Attempt complete</p>
          <h2 className="font-display font-semibold text-4xl tracking-[-.04em] text-slate-900 dark:text-white">Your report is ready.</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{quiz.title} has been graded and added to your history.</p>

          <div className="grid grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)] my-8">
            <div className="bg-[var(--surface)] p-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">Score</span>
              <span className="font-display font-semibold text-3xl text-slate-900 dark:text-white mt-2 block">{submittedResult.score} <small className="text-sm text-[var(--muted)]">pts</small></span>
            </div>
            <div className="bg-[var(--surface)] p-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">Accuracy</span>
              <span className="font-display font-semibold text-3xl text-slate-900 dark:text-white mt-2 block">{submittedResult.accuracy}%</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="sm:flex-grow button-secondary font-semibold py-3 px-5 text-sm"
            >
              Go to Dashboard
            </button>
            <button
              onClick={async () => {
                const attemptId = submittedResult._id || submittedResult.id;
                const response = await axios.get(`/api/quizzes/attempts/${attemptId}/pdf`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `scorecard_${quiz.title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
              }}
              className="sm:flex-grow button-primary font-semibold px-5 py-3 text-sm inline-flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> Download scorecard
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIdx];
  const currentAns = answers[currentIdx];
  const hasAnswer = answer => !!answer && (answer.selectedOption !== null || answer.selectedOptions.length > 0 || answer.booleanAnswer !== null || answer.textAnswer.trim() !== '');
  const answeredCount = answers.filter(hasAnswer).length;
  const locked = isSubmitting || timeLeft === 0 || violationCount >= 3;
  const types = { mcq: 'Choose one answer', multiple_correct: 'Select all that apply', true_false: 'Choose true or false', fill_blank: 'Write your answer' };
  const clearAnswer = () => setAnswers(previous => previous.map((answer, index) => index === currentIdx ? { ...answer, selectedOption: null, selectedOptions: [], booleanAnswer: null, textAnswer: '' } : answer));

  return <div className="live-quiz">
    <WebcamMonitor quizId={id} onViolationLog={() => setViolationCount(previous => previous + 1)}/>
    <header className="live-topbar"><div><p className="desk-label">CODEARENA / ASSESSMENT IN PROGRESS</p><h1>{quiz.title}</h1></div><div className="live-session-meta"><span>{quiz.category}</span><span>{quiz.totalMarks} marks</span></div></header>
    {notice && <p className="desk-alert" role="status">{notice}</p>}
    {submitError && <div role="alert" className="desk-alert">{submitError}<button onClick={handleSubmitQuiz} disabled={isSubmitting} className="underline ml-3">Retry submission</button></div>}
    <div className="live-layout">
      <section className="live-question" aria-labelledby="live-question-heading">
        <div className="live-question-meta"><span>QUESTION {String(currentIdx + 1).padStart(2, '0')} <span className="text-[var(--muted)]">/ {String(quiz.questions.length).padStart(2, '0')}</span></span><button onClick={() => toggleReview(currentIdx)} disabled={locked} aria-pressed={reviewed.includes(currentIdx)} className={reviewed.includes(currentIdx) ? 'is-flagged' : ''}><Flag size={14}/>{reviewed.includes(currentIdx) ? 'Marked for review' : 'Mark for review'}</button></div>
        <div className="live-question-body"><p className="live-answer-instruction">{types[currentQ.questionType]}<span className="level-label" data-level={currentQ.difficulty}>{currentQ.difficulty}</span></p><h2 id="live-question-heading">{currentQ.questionText}</h2>
          <fieldset disabled={locked} className="live-answers"><legend className="sr-only">{types[currentQ.questionType]}</legend>
            {['mcq', 'multiple_correct'].includes(currentQ.questionType) && currentQ.options.map((option, index) => {
              const multiple = currentQ.questionType === 'multiple_correct';
              const selected = multiple ? currentAns.selectedOptions.includes(index) : currentAns.selectedOption === index;
              return <label key={currentQ._id + '-' + index} className={'live-option ' + (selected ? 'is-chosen' : '')}><span className="live-option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className="live-option-text">{option}</span><input type={multiple ? 'checkbox' : 'radio'} name={'answer-' + currentQ._id} checked={selected} onChange={() => multiple ? handleCheckboxChange(currentIdx, index) : handleOptionChange(currentIdx, index)}/></label>;
            })}
            {currentQ.questionType === 'true_false' && <div className="live-boolean">{[true, false].map(value => <label key={String(value)} className={'live-option ' + (currentAns.booleanAnswer === value ? 'is-chosen' : '')}><span>{value ? 'True' : 'False'}</span><input type="radio" name={'answer-' + currentQ._id} checked={currentAns.booleanAnswer === value} onChange={() => handleBooleanChange(currentIdx, value)}/></label>)}</div>}
            {currentQ.questionType === 'fill_blank' && <label className="live-written"><span>Your answer</span><input type="text" value={currentAns.textAnswer} onChange={event => handleTextChange(currentIdx, event.target.value)} placeholder="Enter your answer" autoComplete="off"/></label>}
          </fieldset>
          <div className="live-answer-footer"><span>{hasAnswer(currentAns) ? <><Check size={13}/>Answer selected</> : 'No answer selected'}</span><button onClick={clearAnswer} disabled={locked || !hasAnswer(currentAns)}>Clear answer</button></div>
        </div>
        <footer className="live-question-nav"><button onClick={() => setCurrentIdx(previous => previous - 1)} disabled={currentIdx === 0 || isSubmitting}><ArrowLeft size={16}/>Previous</button><span>{currentIdx + 1} of {quiz.questions.length}</span>{currentIdx < quiz.questions.length - 1 ? <button onClick={() => setCurrentIdx(previous => previous + 1)} disabled={isSubmitting}>Next question<ArrowRight size={16}/></button> : <button onClick={() => setSubmitReview(true)} disabled={locked}>Review & submit<ArrowRight size={16}/></button>}</footer>
      </section>
      <aside className="live-sidebar">
        <div className={'live-timer ' + (timeLeft < 120 ? 'time-low' : '')}><p><Clock size={14}/>TIME REMAINING</p><strong role="timer" aria-label="Time remaining">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}<span>:</span>{String(timeLeft % 60).padStart(2, '0')}</strong><span>of {quiz.duration} minutes</span></div>
        <div className="live-progress"><div><h2>Your progress</h2><span>{answeredCount}/{quiz.questions.length}</span></div><div className="live-progress-track"><span style={{ width: answeredCount / quiz.questions.length * 100 + '%' }}/></div><p>{quiz.questions.length - answeredCount} unanswered · {reviewed.length} marked for review</p></div>
        <nav className="live-question-map" aria-label="Question navigation">{quiz.questions.map((question, index) => <button key={question._id} onClick={() => setCurrentIdx(index)} disabled={isSubmitting} aria-current={currentIdx === index ? 'step' : undefined} aria-label={'Question ' + (index + 1) + (hasAnswer(answers[index]) ? ', answered' : ', unanswered') + (reviewed.includes(index) ? ', marked for review' : '')} className={(hasAnswer(answers[index]) ? 'is-answered ' : '') + (reviewed.includes(index) ? 'is-review ' : '')}>{index + 1}{reviewed.includes(index) && <span aria-hidden="true"/>}</button>)}</nav>
        <div className="live-legend"><span><i className="answered"/>Answered</span><span><i className="review"/>Review</span><span><i/>Unanswered</span></div>
        <div className="live-submit-block">{submitReview ? <div className="live-submit-review"><h3>Submit this attempt?</h3><p>{answeredCount} answered, {quiz.questions.length - answeredCount} unanswered, and {reviewed.length} marked for review. You cannot change answers after submitting.</p><button onClick={handleSubmitQuiz} disabled={isSubmitting} className="live-submit">{isSubmitting ? 'Submitting…' : 'Confirm submission'}<Check size={15}/></button><button onClick={() => setSubmitReview(false)} disabled={isSubmitting} className="live-keep-working">Keep working</button></div> : <><button onClick={() => locked ? handleSubmitQuiz() : setSubmitReview(true)} disabled={isSubmitting} className="live-submit">{isSubmitting ? 'Submitting…' : locked ? 'Retry submission' : 'Finish assessment'}<ArrowRight size={15}/></button><p>Review your answers before submitting.</p></>}</div>
        <div className="live-session-note"><span><AlertTriangle size={13}/>{violationCount} / 3 proctoring events</span><p>Stay on this page and keep your camera on. Answers are held in this session until submission.</p></div>
      </aside>
    </div>
  </div>;
}
