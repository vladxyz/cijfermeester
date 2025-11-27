import React from 'react';
import { Trash2 } from 'lucide-react';
import { Course } from '../types';

interface CourseRowProps {
  course: Course;
  onChange: (updated: Course) => void;
  onDelete: () => void;
}

export const CourseRow: React.FC<CourseRowProps> = ({ course, onChange, onDelete }) => {
  const handleGradeChange = (val: string) => {
    const num = val === '' ? null : parseFloat(val);
    onChange({ ...course, grade: num });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-2 hover:border-indigo-100 transition-colors">
      
      {/* Name Input */}
      <div className="md:col-span-4 flex flex-col">
        <label className="text-xs text-gray-400 mb-1 md:hidden">Vaknaam</label>
        <input
          type="text"
          value={course.name}
          onChange={(e) => onChange({ ...course, name: e.target.value })}
          className="font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-indigo-500 focus:outline-none py-1 transition-colors"
          placeholder="Naam van het vak"
        />
      </div>

      {/* Weight Input */}
      <div className="md:col-span-2 flex flex-col">
        <label className="text-xs text-gray-400 mb-1">Weging</label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={course.weight}
          onChange={(e) => onChange({ ...course, weight: parseFloat(e.target.value) || 0 })}
          className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Min Grade Input (Pass Mark) */}
      <div className="md:col-span-2 flex flex-col">
        <label className="text-xs text-gray-400 mb-1">Min. Cijfer</label>
        <input
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={course.minGrade}
          onChange={(e) => onChange({ ...course, minGrade: parseFloat(e.target.value) || 5.0 })}
          className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm text-gray-600 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Current Grade Input */}
      <div className="md:col-span-3 flex flex-col relative">
        <label className="text-xs text-indigo-600 font-medium mb-1">Behaald Cijfer</label>
        <input
          type="number"
          min="1"
          max="10"
          step="0.1"
          placeholder="Nog niet behaald"
          value={course.grade === null ? '' : course.grade}
          onChange={(e) => handleGradeChange(e.target.value)}
          className={`border rounded px-3 py-1.5 text-sm font-bold focus:ring-2 outline-none transition-all ${
            course.grade !== null 
              ? course.grade >= course.minGrade 
                ? 'border-green-200 bg-green-50 text-green-700 focus:ring-green-400'
                : 'border-red-200 bg-red-50 text-red-700 focus:ring-red-400'
              : 'border-indigo-200 bg-white text-gray-800 focus:ring-indigo-400 placeholder-gray-300'
          }`}
        />
      </div>

      {/* Delete Action */}
      <div className="md:col-span-1 flex justify-end">
        <button 
          onClick={onDelete}
          className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
          title="Verwijder vak"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};