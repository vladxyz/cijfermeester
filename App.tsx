import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap, Github } from 'lucide-react';
import { Module, Course } from './types';
import { createEmptyModule, createEmptyCourse, calculateModuleStats } from './utils';
import { ModuleConfig } from './components/ModuleConfig';
import { CourseRow } from './components/CourseRow';
import { ResultsPanel } from './components/ResultsPanel';

const App: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cijfermeester_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
            setModules(parsed);
            setActiveModuleId(parsed[0].id);
            return;
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    // Default state if empty
    const initialModule = createEmptyModule();
    setModules([initialModule]);
    setActiveModuleId(initialModule.id);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (modules.length > 0) {
        localStorage.setItem('cijfermeester_data', JSON.stringify(modules));
    }
  }, [modules]);

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];

  const updateModule = (updated: Module) => {
    setModules(modules.map(m => m.id === updated.id ? updated : m));
  };

  const addModule = () => {
    const newMod = createEmptyModule();
    setModules([...modules, newMod]);
    setActiveModuleId(newMod.id);
  };

  const deleteModule = (id: string) => {
    if (modules.length <= 1) {
        alert("Je moet minstens één module hebben.");
        return;
    }
    const filtered = modules.filter(m => m.id !== id);
    setModules(filtered);
    setActiveModuleId(filtered[0].id);
  };

  const addCourse = () => {
    if (!activeModule) return;
    const newCourse = createEmptyCourse();
    const updatedModule = {
        ...activeModule,
        courses: [...activeModule.courses, newCourse]
    };
    updateModule(updatedModule);
  };

  const updateCourse = (updatedCourse: Course) => {
    if (!activeModule) return;
    const updatedCourses = activeModule.courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
    updateModule({ ...activeModule, courses: updatedCourses });
  };

  const deleteCourse = (courseId: string) => {
    if (!activeModule) return;
    const updatedCourses = activeModule.courses.filter(c => c.id !== courseId);
    updateModule({ ...activeModule, courses: updatedCourses });
  };

  // Calculate stats for current view
  const stats = activeModule ? calculateModuleStats(activeModule) : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <GraduationCap size={24} />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
                    CijferMeester
                </h1>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto max-w-[60vw] sm:max-w-none no-scrollbar">
                {modules.map(mod => (
                    <button
                        key={mod.id}
                        onClick={() => setActiveModuleId(mod.id)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            activeModuleId === mod.id 
                                ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' 
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {mod.name}
                    </button>
                ))}
                <button 
                    onClick={addModule}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeModule && stats ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <ModuleConfig 
                        module={activeModule} 
                        onChange={updateModule} 
                        onDelete={() => deleteModule(activeModule.id)} 
                    />

                    <div>
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-lg font-bold text-gray-800">Vakken</h3>
                            <button 
                                onClick={addCourse}
                                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm hover:shadow transition-all"
                            >
                                <Plus size={16} /> Vak Toevoegen
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Header Row for large screens */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <div className="col-span-4">Naam</div>
                                <div className="col-span-2">Weging</div>
                                <div className="col-span-2">Min. Eis</div>
                                <div className="col-span-3">Cijfer</div>
                                <div className="col-span-1"></div>
                            </div>

                            {activeModule.courses.map((course) => (
                                <CourseRow 
                                    key={course.id} 
                                    course={course} 
                                    onChange={updateCourse} 
                                    onDelete={() => deleteCourse(course.id)} 
                                />
                            ))}
                            
                            {activeModule.courses.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400">Nog geen vakken toegevoegd.</p>
                                    <button onClick={addCourse} className="text-indigo-600 font-semibold mt-2 hover:underline">
                                        Voeg je eerste vak toe
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats */}
                <div className="lg:col-span-1">
                    <ResultsPanel module={activeModule} stats={stats} />
                </div>
            </div>
        ) : (
            <div className="flex items-center justify-center h-64">
                <p>Module laden...</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;