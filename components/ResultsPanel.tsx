import React, { useState } from 'react';
import { Module, CalculationResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target, CheckCircle2, AlertTriangle, TrendingUp, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ResultsPanelProps {
  module: Module;
  stats: CalculationResult;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ module, stats }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Data for the mini visualizer
  const data = [
    { name: 'Behaald', value: stats.totalWeightAccumulated, color: '#4f46e5' }, // Indigo 600
    { name: 'Nog te gaan', value: stats.totalWeightPossible - stats.totalWeightAccumulated, color: '#e5e7eb' }, // Gray 200
  ];

  const remainingCourses = module.courses.filter(c => c.grade === null);
  const targetGrade = module.targetAverage || module.minAverage;
  const isCompleted = remainingCourses.length === 0;

  // Helper to calculate position percentage (0-100) for scale 1-10
  const getPos = (val: number) => Math.max(0, Math.min(100, ((val - 1) / 9) * 100));

  const handleDownload = async () => {
    setIsDownloading(true);

    // 1. Create a temporary container for the A4 layout
    const printContainer = document.createElement('div');
    // Using absolute positioning at top/left 0 with negative z-index ensures 
    // it renders fully without affecting the current view, and avoids clipping issues associated with 'left: -9999px'
    printContainer.style.position = 'absolute';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.zIndex = '-50'; 
    printContainer.style.width = '794px'; // A4 width at approx 96 DPI
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.padding = '40px';
    printContainer.style.fontFamily = 'Inter, sans-serif';
    printContainer.style.color = '#1f2937';
    printContainer.style.boxSizing = 'border-box';
    
    // 2. Build the HTML Content
    const date = new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Graph calculation for Print
    const leftPct = getPos(stats.minPossibleAverage);
    const widthPct = getPos(stats.maxPossibleAverage) - leftPct;
    const targetPct = getPos(targetGrade);

    printContainer.innerHTML = `
      <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1 style="font-size: 28px; font-weight: 800; color: #312e81; margin: 0;">CijferMeester Rapport</h1>
            <p style="color: #6b7280; margin-top: 5px;">Gegenereerd op ${date}</p>
        </div>
        <div style="text-align: right;">
            <h2 style="font-size: 20px; font-weight: 600; color: #111827;">${module.name}</h2>
            <p style="color: #4f46e5; font-weight: 500;">Resultatenoverzicht</p>
        </div>
      </div>

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 700; margin-bottom: 15px;">Configuratie</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
            <div>
                <p style="font-size: 12px; color: #6b7280;">Min. Voldoende</p>
                <p style="font-size: 18px; font-weight: 700;">${module.minAverage}</p>
            </div>
            <div>
                <p style="font-size: 12px; color: #6b7280;">Gewenst Doel</p>
                <p style="font-size: 18px; font-weight: 700; color: #4f46e5;">${targetGrade}</p>
            </div>
            <div>
                <p style="font-size: 12px; color: #6b7280;">Totaal Studiepunten</p>
                <p style="font-size: 18px; font-weight: 700;">${stats.totalWeightPossible}</p>
            </div>
        </div>
      </div>

      <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 15px;">Vakken Overzicht</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
        <thead>
            <tr style="background-color: #e0e7ff; color: #312e81;">
                <th style="text-align: left; padding: 10px; border: 1px solid #c7d2fe;">Vaknaam</th>
                <th style="text-align: center; padding: 10px; border: 1px solid #c7d2fe;">Weging</th>
                <th style="text-align: center; padding: 10px; border: 1px solid #c7d2fe;">Min. Eis</th>
                <th style="text-align: center; padding: 10px; border: 1px solid #c7d2fe;">Behaald</th>
            </tr>
        </thead>
        <tbody>
            ${module.courses.map(course => `
                <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 500;">${course.name}</td>
                    <td style="text-align: center; padding: 10px; border: 1px solid #e5e7eb;">${course.weight}</td>
                    <td style="text-align: center; padding: 10px; border: 1px solid #e5e7eb;">${course.minGrade}</td>
                    <td style="text-align: center; padding: 10px; border: 1px solid #e5e7eb; font-weight: 700; color: ${
                        course.grade === null ? '#9ca3af' : 
                        course.grade < course.minGrade ? '#dc2626' : '#16a34a'
                    };">
                        ${course.grade !== null ? course.grade : '-'}
                    </td>
                </tr>
            `).join('')}
        </tbody>
      </table>

      <div style="background-color: ${stats.passed ? '#f0fdf4' : stats.hasFailedCourse ? '#fef2f2' : '#fff7ed'}; border: 1px solid ${stats.passed ? '#bbf7d0' : stats.hasFailedCourse ? '#fecaca' : '#fed7aa'}; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
         <h3 style="font-size: 18px; font-weight: 800; color: ${stats.passed ? '#166534' : stats.hasFailedCourse ? '#991b1b' : '#9a3412'}; margin-bottom: 10px;">
            ${stats.passed ? 'Module Status: GEHAALD' : 'Module Status: NIET GEHAALD'}
         </h3>
         
         <div style="display: flex; gap: 40px; margin-top: 20px;">
            <div>
                <p style="font-size: 12px; text-transform: uppercase; color: #4b5563;">Huidig Gemiddelde</p>
                <p style="font-size: 36px; font-weight: 900; color: #111827;">${stats.currentAverage}</p>
            </div>
            ${stats.requiredAverageForRemaining !== null ? `
                <div>
                    <p style="font-size: 12px; text-transform: uppercase; color: #4b5563;">Benodigd voor Rest</p>
                    <p style="font-size: 36px; font-weight: 900; color: ${stats.requiredAverageForRemaining > 10 ? '#dc2626' : '#4f46e5'};">
                        ${stats.requiredAverageForRemaining}
                    </p>
                </div>
            ` : ''}
         </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 10px;">Haalbaarheid Prognose</h3>
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">
           Bereik van laagst tot hoogst haalbare gemiddelde.
        </p>
        <div style="position: relative; height: 30px; background-color: #f3f4f6; border-radius: 999px; overflow: hidden; margin-bottom: 5px;">
            <!-- Range Bar -->
            <div style="position: absolute; top: 0; bottom: 0; background-color: #c7d2fe; left: ${leftPct}%; width: ${widthPct}%;"></div>
            
            <!-- Target Marker -->
            <div style="position: absolute; top: 0; bottom: 0; width: 2px; background-color: #4f46e5; left: ${targetPct}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #4b5563;">
           <span>1.0</span>
           <span style="font-weight: bold; color: #4f46e5;">Doel: ${targetGrade}</span>
           <span>10.0</span>
        </div>
        <div style="margin-top: 5px; font-size: 12px; color: #374151;">
           Minimaal haalbaar: <strong>${stats.minPossibleAverage}</strong> — Maximaal haalbaar: <strong>${stats.maxPossibleAverage}</strong>
        </div>
      </div>

    `;

    document.body.appendChild(printContainer);

    try {
        // Wait a brief moment to ensure rendering
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(printContainer, { 
            scale: 2,
            useCORS: true,
            windowHeight: printContainer.scrollHeight + 100 // Ensure full height is captured
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `CijferMeester-Overzicht-${module.name.replace(/\s+/g, '-')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Download failed", e);
        alert("Er ging iets mis bij het genereren van het overzicht.");
    } finally {
        document.body.removeChild(printContainer);
        setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden sticky top-6">
      <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" /> Resultaten
        </h2>
        <p className="text-indigo-200 text-sm mt-1">
            Doel: {targetGrade} gemiddeld over {stats.totalWeightPossible} studiepunten/weging.
        </p>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Main Score Display */}
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Huidig Gemiddelde</p>
                <div className={`text-4xl font-extrabold mt-1 ${stats.passed || (stats.currentAverage >= module.minAverage && !stats.hasFailedCourse) ? 'text-green-600' : 'text-orange-500'}`}>
                    {stats.currentAverage}
                </div>
            </div>
            
            <div className="h-16 w-16">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={30}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Range / Feasibility Graph */}
        <div className="space-y-2">
             <div className="flex justify-between items-end">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Haalbaarheid</p>
                <p className="text-xs text-indigo-600 font-medium">Doel: {targetGrade}</p>
             </div>
             <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                 {/* The Range Bar */}
                 <div 
                    className="absolute top-0 bottom-0 bg-indigo-200 opacity-70"
                    style={{
                        left: `${getPos(stats.minPossibleAverage)}%`,
                        width: `${getPos(stats.maxPossibleAverage) - getPos(stats.minPossibleAverage)}%`
                    }}
                    title={`Haalbaar bereik: ${stats.minPossibleAverage} - ${stats.maxPossibleAverage}`}
                 />
                 
                 {/* Current Average Marker (if meaningful) */}
                 {stats.totalWeightAccumulated > 0 && (
                    <div 
                        className="absolute top-0 bottom-0 w-1 bg-gray-800 z-10"
                        style={{ left: `${getPos(stats.currentAverage)}%` }}
                        title={`Huidig: ${stats.currentAverage}`}
                    />
                 )}

                 {/* Target Marker */}
                 <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 border-l border-indigo-600 border-dashed h-full z-10"
                    style={{ left: `${getPos(targetGrade)}%` }}
                 />
             </div>
             <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>{stats.minPossibleAverage}</span>
                <span>{stats.maxPossibleAverage}</span>
             </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* The Verdict */}
        {isCompleted ? (
             <div className={`rounded-lg p-4 flex gap-3 ${stats.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {stats.passed ? <CheckCircle2 className="shrink-0" /> : <AlertTriangle className="shrink-0" />}
                <div>
                    <p className="font-bold">{stats.passed ? 'Module Gehaald!' : 'Module niet gehaald.'}</p>
                    <p className="text-sm opacity-90">
                        {stats.passed 
                           ? 'Gefeliciteerd! Je hebt alle doelen bereikt.' 
                           : stats.hasFailedCourse 
                             ? 'Eén of meer vakken voldoen niet aan het minimumcijfer.' 
                             : 'Je gemiddelde is te laag.'}
                    </p>
                </div>
             </div>
        ) : (
            <div>
                {/* Early Warning */}
                {stats.hasFailedCourse && (
                    <div className="mb-4 bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 flex gap-2 items-start text-sm">
                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        <span>Let op: Je hebt een vak onvoldoende afgesloten (lager dan het minimum). Je haalt de module momenteel niet.</span>
                    </div>
                )}

                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">Benodigd voor Rest</p>
                
                {stats.requiredAverageForRemaining !== null ? (
                    <>
                        <div className="flex items-baseline gap-2">
                             <span className={`text-5xl font-black ${stats.requiredAverageForRemaining > 10 ? 'text-red-600' : stats.requiredAverageForRemaining > 8 ? 'text-orange-500' : 'text-indigo-600'}`}>
                                {stats.requiredAverageForRemaining}
                             </span>
                             <span className="text-gray-400 font-medium">gemiddeld</span>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-2">
                            Je moet dit halen voor de resterende <strong>{remainingCourses.length}</strong> vak(ken) om op een <strong>{targetGrade}</strong> uit te komen.
                        </p>

                        {stats.requiredAverageForRemaining > 10 && (
                            <div className="mt-3 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex gap-2">
                                <AlertTriangle size={16} className="mt-0.5" />
                                <span>Dit is wiskundig onmogelijk (boven de 10). Probeer je doelen bij te stellen of check of je cijfers kloppen.</span>
                            </div>
                        )}

                        {/* Hypothetical 5.0 projection */}
                        {stats.requiredAverageForRemaining < 5.0 && stats.projectedAverageWith5 !== null && (
                            <div className="mt-4 bg-green-50 text-green-900 text-sm p-3 rounded-lg border border-green-100 flex gap-2 items-start animate-in fade-in slide-in-from-bottom-2">
                                <TrendingUp className="shrink-0 mt-0.5 text-green-600" size={18} />
                                <div>
                                    <span className="font-bold block text-green-800">Je staat er goed voor!</span>
                                    <p className="mt-1 opacity-90 leading-relaxed">
                                        Zelfs met een <strong>5.0</strong> voor de rest kom je nog steeds uit op een gemiddelde van <strong>{stats.projectedAverageWith5}</strong>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                   <p className="text-gray-400 italic">Voeg vakken toe om te berekenen.</p>
                )}
            </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-100">
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border border-indigo-200"
            >
                {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                {isDownloading ? 'Genereren...' : 'Download overzicht (A4)'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">
                Download een compleet overzicht als afbeelding (JPG).
            </p>
        </div>

      </div>
    </div>
  );
};