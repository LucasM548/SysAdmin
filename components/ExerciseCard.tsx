import React, { useState } from 'react';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Question } from '../types';

interface ExerciseCardProps {
  question: Question;
  index: number;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 font-bold rounded-lg text-sm">
              Q{index + 1}
            </span>
            <p className="text-slate-800 font-medium pt-1">{question.question}</p>
          </div>
        </div>

        {question.hint && showHint && (
          <div className="mt-4 ml-11 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex items-start gap-2">
            <HelpCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{question.hint}</span>
          </div>
        )}

        {showAnswer && (
          <div className="mt-4 ml-11">
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto relative group">
              <div className="text-xs text-slate-500 absolute top-2 right-3 font-mono">BASH</div>
              <code className="text-green-400 font-mono text-sm">{question.answer}</code>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
        <div className="flex gap-2">
           {question.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-medium text-slate-500 hover:text-yellow-600 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-yellow-50 transition-colors"
            >
              <HelpCircle size={14} />
              {showHint ? 'Cacher Indice' : 'Voir Indice'}
            </button>
           )}
        </div>
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={`text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showAnswer
              ? 'text-slate-600 bg-slate-200 hover:bg-slate-300'
              : 'text-white bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {showAnswer ? (
            <>
              <EyeOff size={16} /> Cacher Réponse
            </>
          ) : (
            <>
              <Eye size={16} /> Révéler Réponse
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExerciseCard;