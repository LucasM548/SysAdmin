import React from 'react';
import { CourseTopic } from '../types';

interface CourseSectionProps {
  topic: CourseTopic;
}

const CourseSection: React.FC<CourseSectionProps> = ({ topic }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{topic.title}</h2>
      </div>
      
      <div className="p-6 grid gap-8">
        {topic.sections.map((section, idx) => (
          <div key={idx} className="relative pl-6 border-l-2 border-indigo-100">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">{section.title}</h3>
            <ul className="space-y-2 mb-4">
              {section.content.map((point, i) => (
                <li key={i} className="text-slate-600 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
            {section.code && (
              <div className="mt-3 bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner">
                <pre className="text-sm font-mono text-blue-300">
                  {section.code}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSection;
