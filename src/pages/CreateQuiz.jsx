import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, ArrowLeft, HelpCircle, AlertCircle, PlusCircle, Upload, FileText, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Quiz Meta State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState(15);
  const [totalMarks, setTotalMarks] = useState(10);
  const [tagsInput, setTagsInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Import State
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setImportSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/quizzes/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success && response.data?.questions?.length > 0) {
        // Pad MCQ and multiple correct questions with enough options if needed
        const importedQuestions = response.data.questions.map(q => {
          if ((q.questionType === 'mcq' || q.questionType === 'multiple_correct') && q.options.length < 2) {
            const needed = 2 - q.options.length;
            const newOpts = [...q.options];
            for (let i = 0; i < needed; i++) {
              newOpts.push('');
            }
            return { ...q, options: newOpts };
          }
          return q;
        });

        // If current questions list is empty or untouched, replace it
        if (questions.length === 1 && questions[0].questionText === '' && questions[0].options.every(o => o === '')) {
          setQuestions(importedQuestions);
        } else {
          setQuestions([...questions, ...importedQuestions]);
        }

        setImportSuccess(`Successfully imported ${response.data.count} question(s)!`);
      } else {
        setError('No questions could be parsed from the uploaded file.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to import questions. Please check file format.');
    } finally {
      setImporting(false);
      // Reset input value to allow uploading same file name again
      e.target.value = '';
    }
  };

  // Questions State
  const [questions, setQuestions] = useState([
    {
      questionType: 'mcq',
      questionText: '',
      options: ['', ''],
      correctOption: 0,
      correctAnswers: [],
      answer: true,
      correctAnswerText: '',
      explanation: '',
      difficulty: 'medium',
      topic: 'General'
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionType: 'mcq',
        questionText: '',
        options: ['', ''],
        correctOption: 0,
        correctAnswers: [],
        answer: true,
        correctAnswerText: '',
        explanation: '',
        difficulty: 'medium',
        topic: 'General'
      }
    ]);
  };

  const handleRemoveQuestion = (qIdx) => {
    if (questions.length === 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIdx));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    setQuestions(
      questions.map((q, idx) => {
        if (idx !== qIdx) return q;
        const updated = { ...q, [field]: value };

        // Reset correct values when changing type
        if (field === 'questionType') {
          updated.correctOption = value === 'mcq' ? 0 : null;
          updated.correctAnswers = value === 'multiple_correct' ? [0] : [];
          updated.answer = value === 'true_false' ? true : null;
          updated.correctAnswerText = value === 'fill_blank' ? '' : '';
          updated.options = value === 'mcq' || value === 'multiple_correct' ? ['', ''] : [];
        }
        return updated;
      })
    );
  };

  // Options CRUD inside questions
  const handleOptionChange = (qIdx, optIdx, val) => {
    setQuestions(
      questions.map((q, idx) => {
        if (idx !== qIdx) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = val;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleAddOption = (qIdx) => {
    setQuestions(
      questions.map((q, idx) => {
        if (idx !== qIdx) return q;
        return { ...q, options: [...q.options, ''] };
      })
    );
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    setQuestions(
      questions.map((q, idx) => {
        if (idx !== qIdx) return q;
        if (q.options.length <= 2) {
          alert('MCQ/Multiple Correct questions must have at least 2 options.');
          return q;
        }
        const newOpts = q.options.filter((_, oIdx) => oIdx !== optIdx);

        // Adjust index validation for correctOption
        let newCorrectOption = q.correctOption;
        if (q.correctOption === optIdx) {
          newCorrectOption = 0;
        } else if (q.correctOption > optIdx) {
          newCorrectOption -= 1;
        }

        // Adjust for correctAnswers
        const newCorrectAnswers = q.correctAnswers
          .filter((ansIdx) => ansIdx !== optIdx)
          .map((ansIdx) => (ansIdx > optIdx ? ansIdx - 1 : ansIdx));

        return {
          ...q,
          options: newOpts,
          correctOption: newCorrectOption,
          correctAnswers: newCorrectAnswers.length > 0 ? newCorrectAnswers : [0]
        };
      })
    );
  };

  const handleToggleMultipleCorrect = (qIdx, optIdx) => {
    setQuestions(
      questions.map((q, idx) => {
        if (idx !== qIdx) return q;
        const currentAnswers = q.correctAnswers || [];
        const isSelected = currentAnswers.includes(optIdx);
        const newAnswers = isSelected
          ? currentAnswers.filter((item) => item !== optIdx)
          : [...currentAnswers, optIdx];
        return { ...q, correctAnswers: newAnswers };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Quiz title is required.');
      setLoading(false);
      return;
    }
    if (!category.trim()) {
      setError('Quiz category is required.');
      setLoading(false);
      return;
    }
    if (duration <= 0) {
      setError('Duration must be greater than 0 minutes.');
      setLoading(false);
      return;
    }

    // Questions validations
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question #${i + 1} text is empty.`);
        setLoading(false);
        return;
      }
      if (q.questionType === 'mcq' || q.questionType === 'multiple_correct') {
        if (q.options.some((opt) => !opt.trim())) {
          setError(`Question #${i + 1} has empty options.`);
          setLoading(false);
          return;
        }
        if (q.questionType === 'mcq' && (q.correctOption === null || q.correctOption >= q.options.length)) {
          setError(`Question #${i + 1} has an invalid correct option.`);
          setLoading(false);
          return;
        }
        if (q.questionType === 'multiple_correct' && (!q.correctAnswers || q.correctAnswers.length === 0)) {
          setError(`Question #${i + 1} has no correct options selected.`);
          setLoading(false);
          return;
        }
      }
      if (q.questionType === 'fill_blank' && !q.correctAnswerText.trim()) {
        setError(`Question #${i + 1} correct answer text is empty.`);
        setLoading(false);
        return;
      }
    }

    const payload = {
      title,
      description,
      category,
      difficulty,
      duration: Number(duration),
      totalMarks: Number(totalMarks),
      tags: tagsInput.split(',').map((t) => t.trim()).filter((t) => t !== ''),
      questions,
      isPublished
    };

    try {
      await axios.post('/api/quizzes', payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/teacher-dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create quiz. Please verify role access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="p-2.5 rounded-xl nm-btn text-slate-650 dark:text-slate-305"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-outfit font-extrabold text-3xl dark:text-white">Create New Quiz</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Add questions, set details, and publish tests for students</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2 text-sm font-semibold animate-pulse-slow">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 flex items-center gap-2 text-sm font-semibold">
          <span>Quiz created successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Meta Info */}
        <div className="nm-card p-6 rounded-2xl space-y-6">
          <h2 className="font-outfit font-bold text-xl dark:text-white border-b border-slate-200 dark:border-slate-750 pb-2">Quiz Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Quiz Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full nm-input rounded-xl py-3 px-4 text-sm focus:outline-none dark:text-white font-medium"
                placeholder="e.g. JavaScript Arrays & Methods"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full nm-input rounded-xl py-3 px-4 text-sm focus:outline-none dark:text-white font-medium"
                placeholder="e.g. Web Development"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-500 dark:text-white font-medium leading-relaxed"
                placeholder="Describe the quiz goals, rules, or content details..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full nm-input rounded-xl py-3 px-4 text-sm focus:outline-none dark:text-white font-medium"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Duration (Minutes) *</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className="w-full nm-input rounded-xl py-3 px-4 text-sm focus:outline-none dark:text-white font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Total Marks *</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                min="1"
                className="w-full nm-input rounded-xl py-3 px-4 text-sm focus:outline-none dark:text-white font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full nm-input rounded-xl py-3 px-4 text-sm focus:outline-none dark:text-white font-medium"
                placeholder="e.g. javascript, arrays, coding"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="isPublished" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">
              Publish quiz immediately (make it visible to students)
            </label>
          </div>
        </div>

        {/* Import Questions Section */}
        <div className="nm-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600" />
              <h2 className="font-outfit font-bold text-xl dark:text-white">Import Questions from PDF/TXT</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 font-semibold transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{showInstructions ? 'Hide Guide' : 'Show Guide'}</span>
            </button>
          </div>

          {showInstructions && (
            <div className="p-4 rounded-xl nm-inset-sm text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p className="font-bold text-slate-700 dark:text-slate-300">💡 File Formatting Guide for Best Results:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Start each question block with a number (e.g., <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">1. What is HTML?</code>)</li>
                <li>List options with letters (e.g., <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">A) Option text</code>, <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">B) Option text</code>)</li>
                <li>Specify the correct option on a line starting with Answer (e.g., <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Answer: A</code>)</li>
                <li>For multiple correct answers, separate with commas (e.g., <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Answer: A, C</code>)</li>
                <li>For True/False, specify answer directly (e.g., <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Answer: False</code>)</li>
                <li>Optionally add explanation (e.g., <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Explanation: Reason here...</code>)</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 hover:border-brand-500 transition-colors nm-inset-sm bg-transparent relative">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={importing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {importing ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Processing file and extracting questions...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-2">
                <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Drag & drop your file here, or <span className="text-brand-600 hover:text-brand-700 cursor-pointer">browse</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Supports PDF and TXT question papers</p>
              </div>
            )}
          </div>

          {importSuccess && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>{importSuccess}</span>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <h2 className="font-outfit font-bold text-xl dark:text-white">Questions</h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1 nm-btn text-brand-600 dark:text-brand-400 font-bold text-xs px-3 py-2 rounded-xl"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="nm-card p-6 rounded-2xl relative space-y-6">
              
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Question #{qIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIdx)}
                  className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Question configuration fields */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Question Type</label>
                  <select
                    value={q.questionType}
                    onChange={(e) => handleQuestionChange(qIdx, 'questionType', e.target.value)}
                    className="w-full nm-input rounded-xl py-2 px-3 text-xs focus:outline-none dark:text-white font-medium"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="multiple_correct">Multiple Correct Answers</option>
                    <option value="true_false">True / False</option>
                    <option value="fill_blank">Fill in the Blank</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Topic / Category</label>
                  <input
                    type="text"
                    value={q.topic}
                    onChange={(e) => handleQuestionChange(qIdx, 'topic', e.target.value)}
                    className="w-full nm-input rounded-xl py-2 px-3 text-xs focus:outline-none dark:text-white font-medium"
                    placeholder="e.g. Scope, Functions"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Difficulty</label>
                  <select
                    value={q.difficulty}
                    onChange={(e) => handleQuestionChange(qIdx, 'difficulty', e.target.value)}
                    className="w-full nm-input rounded-xl py-2 px-3 text-xs focus:outline-none dark:text-white font-medium"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Question Text *</label>
                <textarea
                  value={q.questionText}
                  onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                  rows="2"
                  className="w-full nm-input rounded-xl py-3 px-4 text-sm focus:outline-none dark:text-white font-medium leading-relaxed"
                  placeholder="e.g. What is the output of typeof null?"
                  required
                />
              </div>

              {/* Options & Correct Answer block */}
              <div className="space-y-3 p-4 rounded-xl nm-inset-sm bg-transparent">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Options & Correct Answer Setup</h4>

                {/* MCQ Mode */}
                {q.questionType === 'mcq' && (
                  <div className="space-y-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-option-${qIdx}`}
                          checked={q.correctOption === optIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctOption', optIdx)}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          className="flex-grow nm-input rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-900 dark:text-white font-medium"
                          placeholder={`Option ${optIdx + 1}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIdx, optIdx)}
                          className="text-red-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(qIdx)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 mt-1 nm-btn px-2.5 py-1 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Option</span>
                    </button>
                  </div>
                )}

                {/* Multiple Correct Answers Mode */}
                {q.questionType === 'multiple_correct' && (
                  <div className="space-y-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={(q.correctAnswers || []).includes(optIdx)}
                          onChange={() => handleToggleMultipleCorrect(qIdx, optIdx)}
                          className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          className="flex-grow nm-input rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-900 dark:text-white font-medium"
                          placeholder={`Option ${optIdx + 1}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIdx, optIdx)}
                          className="text-red-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(qIdx)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 mt-1 nm-btn px-2.5 py-1 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Option</span>
                    </button>
                  </div>
                )}

                {/* True / False Mode */}
                {q.questionType === 'true_false' && (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleQuestionChange(qIdx, 'answer', true)}
                      className={`flex-grow py-2 rounded-xl text-xs font-bold transition-all ${
                        q.answer === true
                          ? 'nm-inset text-brand-700 dark:text-white border border-brand-500/30'
                          : 'nm-btn text-slate-750 dark:text-slate-300'
                      }`}
                    >
                      TRUE IS CORRECT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuestionChange(qIdx, 'answer', false)}
                      className={`flex-grow py-2 rounded-xl text-xs font-bold transition-all ${
                        q.answer === false
                          ? 'nm-inset text-brand-700 dark:text-white border border-brand-500/30'
                          : 'nm-btn text-slate-750 dark:text-slate-300'
                      }`}
                    >
                      FALSE IS CORRECT
                    </button>
                  </div>
                )}

                {/* Fill in the Blank Mode */}
                {q.questionType === 'fill_blank' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Correct Answer String *</label>
                    <input
                      type="text"
                      value={q.correctAnswerText}
                      onChange={(e) => handleQuestionChange(qIdx, 'correctAnswerText', e.target.value)}
                      className="w-full nm-input rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-900 dark:text-white font-medium"
                      placeholder="e.g. object (case-insensitive grading)"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Explanation Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Explanation / Solution Details</label>
                <textarea
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                  rows="2"
                  className="w-full nm-input rounded-xl py-2.5 px-3.5 text-xs focus:outline-none dark:text-white leading-relaxed"
                  placeholder="Explain why this answer is correct..."
                />
              </div>

            </div>
          ))}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate('/teacher-dashboard')}
            className="nm-btn text-slate-700 dark:text-slate-200 font-semibold text-sm px-6 py-3 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 nm-btn-primary font-semibold text-sm px-6 py-3 rounded-xl disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Save & Publish'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
