import React from 'react';
import { Module } from '../types';
import { Settings, Trash, Target } from 'lucide-react';

interface ModuleConfigProps {
  module: Module;
  onChange: (m: Module) => void;
  onDelete: () => void;
}

export const ModuleConfig: React.FC<ModuleConfigProps> = ({ module, onChange, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6">
        <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Module Naam</label>
            <input 
                type="text" 
                value={module.name}
                onChange={(e) => onChange({...module, name: e.target.value})}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none w-full transition-colors pb-1"
                placeholder="Naam van de module"
            />
        </div>
        <button 
            onClick={onDelete}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
            <Trash size={16} /> Module Verwijderen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Settings size={14} /> Min. gemiddelde voor voldoende
            </label>
            <input 
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={module.minAverage}
                onChange={(e) => onChange({...module, minAverage: parseFloat(e.target.value) || 5.8})}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Standaard: 5.8</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-indigo-700 mb-1">
                <Target size={14} /> Mijn gewenste gemiddelde (Doel)
            </label>
            <input 
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={module.targetAverage ?? module.minAverage}
                onChange={(e) => onChange({...module, targetAverage: parseFloat(e.target.value)})}
                className="w-full border border-indigo-200 bg-indigo-50/50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-900"
            />
            <p className="text-xs text-gray-400 mt-1">Laat leeg om min. te gebruiken</p>
          </div>
      </div>
    </div>
  );
};