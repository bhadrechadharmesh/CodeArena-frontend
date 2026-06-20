import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, ArrowLeft, Code2, AlertCircle, Sparkles } from 'lucide-react';

export default function CreateChallenge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Challenge Meta
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [constraints, setConstraints] = useState('');
  const [supportedLanguages, setSupportedLanguages] = useState(['cpp', 'java', 'python', 'javascript']);

  // Examples (Used for display)
  const [examples, setExamples] = useState([
    { input: '', output: '', explanation: '' }
  ]);

  // Test cases (Used for evaluation)
  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '', isHidden: false }
  ]);

  const handleAddExample = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }]);
  };

  const handleRemoveExample = (idx) => {
    if (examples.length === 1) return;
    setExamples(examples.filter((_, i) => i !== idx));
  };

  const handleExampleChange = (idx, field, value) => {
    setExamples(examples.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };

  const handleRemoveTestCase = (idx) => {
    if (testCases.length === 1) return;
    setTestCases(testCases.filter((_, i) => i !== idx));
  };

  const handleTestCaseChange = (idx, field, value) => {
    setTestCases(testCases.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleLanguageToggle = (lang) => {
    if (supportedLanguages.includes(lang)) {
      if (supportedLanguages.length === 1) {
        setError('At least one language must be supported.');
        return;
      }
      setSupportedLanguages(supportedLanguages.filter(l => l !== lang));
    } else {
      setSupportedLanguages([...supportedLanguages, lang]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Please specify a title.');
      return;
    }
    if (!description.trim()) {
      setError('Please specify a description.');
      return;
    }

    // Verify examples have values
    for (let i = 0; i < examples.length; i++) {
      if (!examples[i].input.trim() || !examples[i].output.trim()) {
        setError(`Please fill in both input and output for Example #${i + 1}.`);
        return;
      }
    }

    // Verify test cases have values
    for (let i = 0; i < testCases.length; i++) {
      if (!testCases[i].input.trim() || !testCases[i].expectedOutput.trim()) {
        setError(`Please fill in both input and expected output for Test Case #${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    try {
      await axios.post('/api/challenges', {
        title,
        description,
        difficulty,
        constraints,
        examples,
        testCases,
        supportedLanguages
      });
      navigate('/teacher-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coding challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-350"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-outfit font-extrabold text-3xl dark:text-white flex items-center gap-2">
            <Code2 className="h-8 w-8 text-indigo-500" />
            Create Coding Challenge
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Design competitive programming challenges with custom input examples, hidden test cases, and language limits.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-650 dark:text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Specifications */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-outfit font-bold text-lg dark:text-white border-b border-slate-100 dark:border-slate-750 pb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            General Specifications
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Challenge Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
                placeholder="e.g. Find Longest Palindrome"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Problem Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 dark:text-white font-mono"
              placeholder="Describe the challenge parameters, expected arguments, and background..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Constraints (Optional)
              </label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
                placeholder="e.g. 1 <= N <= 10^5, Time Limit: 2s"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Allowed Languages
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['cpp', 'java', 'python', 'javascript'].map((lang) => {
                  const isSelected = supportedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-400'
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900/55 dark:border-slate-800'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-750 pb-2">
            <h3 className="font-outfit font-bold text-lg dark:text-white">
              Public Examples ({examples.length})
            </h3>
            <button
              type="button"
              onClick={handleAddExample}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Example</span>
            </button>
          </div>

          <div className="space-y-4">
            {examples.map((ex, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50/30 dark:bg-slate-900/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Example #{idx + 1}</span>
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(idx)}
                      className="text-red-500 hover:text-red-650 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Input</label>
                    <textarea
                      value={ex.input}
                      onChange={(e) => handleExampleChange(idx, 'input', e.target.value)}
                      rows="2"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-550 dark:text-white font-mono"
                      placeholder='e.g. "racecar"'
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Output</label>
                    <textarea
                      value={ex.output}
                      onChange={(e) => handleExampleChange(idx, 'output', e.target.value)}
                      rows="2"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-550 dark:text-white font-mono"
                      placeholder="e.g. true"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Explanation (Optional)</label>
                  <input
                    type="text"
                    value={ex.explanation}
                    onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-550 dark:text-white"
                    placeholder="Describe how the input produces the output..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Cases Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-750 pb-2">
            <h3 className="font-outfit font-bold text-lg dark:text-white">
              Evaluation Test Cases ({testCases.length})
            </h3>
            <button
              type="button"
              onClick={handleAddTestCase}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Test Case</span>
            </button>
          </div>

          <div className="space-y-4">
            {testCases.map((tc, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50/30 dark:bg-slate-900/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Test Case #{idx + 1}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-350 select-none">
                      <input
                        type="checkbox"
                        checked={tc.isHidden}
                        onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 h-3.5 w-3.5"
                      />
                      <span>Hidden (Proctor Evaluation)</span>
                    </label>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-red-500 hover:text-red-650 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Standard Input (stdin)</label>
                    <textarea
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                      rows="2.5"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-550 dark:text-white font-mono"
                      placeholder="e.g. racecar\n"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Expected Output (stdout)</label>
                    <textarea
                      value={tc.expectedOutput}
                      onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                      rows="2.5"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-550 dark:text-white font-mono"
                      placeholder="e.g. true\n"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/teacher-dashboard')}
            className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Challenge'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
