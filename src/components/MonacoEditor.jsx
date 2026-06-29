import React from 'react';
import Editor from '@monaco-editor/react';

export const LANGUAGE_TEMPLATES = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    string input;\n    if (cin >> input) {\n        cout << input;\n    }\n    return 0;\n}`,
  java: `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your Java code here\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            System.out.print(sc.next());\n        }\n    }\n}`,
  python: `# Write your Python code here\nimport sys\ninput_data = sys.stdin.read().strip()\nprint(input_data)`,
  javascript: `// Write your JavaScript code here\nimport fs from 'fs';\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input);`
};

export default function MonacoEditor({
  code,
  setCode,
  language,
  setLanguage,
  supportedLanguages = ['cpp', 'java', 'python', 'javascript'],
  sampleCode = null
}) {
  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    const sample = sampleCode?.[lang] || '';
    setCode(sample || LANGUAGE_TEMPLATES[lang]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <span className="w-3 w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="w-3 w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span className="w-3 w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="ml-2 font-mono text-xs text-slate-400">solution_editor.src</span>
        </div>

        {/* Action Panel: Reset and Select Language */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your editor to the starter/sample code?')) {
                const sample = sampleCode?.[language] || '';
                setCode(sample || LANGUAGE_TEMPLATES[language]);
              }
            }}
            className="bg-slate-750 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none transition-colors"
            title="Reset editor to default starter code"
          >
            Reset Code
          </button>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 font-medium focus:outline-none"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'cpp' ? 'C++ (g++)' : lang === 'java' ? 'Java (OpenJDK)' : lang === 'python' ? 'Python 3' : 'Node.js'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-grow h-[450px]">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'python' : 'javascript'}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
}
