import React from 'react';
import { Submission } from '../../types';

interface ContributionGraphProps {
  submissions: Submission[];
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({ submissions }) => {
  // Config
  const totalWeeks = 26; // Show last 6 months
  const daysToShow = totalWeeks * 7;
  
  const { gridCells, monthLabels } = React.useMemo(() => {
    // Calculate date range
    const today = new Date();
    const endDate = today;
    
    const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Normalize submissions to YYYY-MM-DD for easy lookup
    const submissionCounts: Record<string, number> = {};
    submissions.forEach(sub => {
      const date = new Date(sub.timestamp);
      const key = getLocalDateString(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
      submissionCounts[key] = (submissionCounts[key] || 0) + 1;
    });

    // Generate calendar grid data
    const gridCells = [];
    // Start from Sunday of the week 'totalWeeks' ago
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysToShow);
    
    // Adjust to start on a Sunday
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const monthLabels = [];
    let currentMonth = -1;

    // Iterate days
    const currentDate = new Date(startDate);
    for (let i = 0; i < daysToShow; i++) {
      const dateKey = getLocalDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
      const count = submissionCounts[dateKey] || 0;
      
      // Determine intensity level
      let level = 0;
      if (count >= 1) level = 1;
      if (count >= 2) level = 2;
      if (count >= 3) level = 3;
      if (count >= 4) level = 4;

      if (currentDate.getDate() === 1 || (i === 0 && currentDate.getDate() <= 15)) {
        if (currentDate.getMonth() !== currentMonth) {
          monthLabels.push({ index: Math.floor(i / 7), month: currentDate.toLocaleString('default', { month: 'short' }) });
          currentMonth = currentDate.getMonth();
        }
      }

      gridCells.push({
        date: dateKey,
        count,
        level
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return { gridCells, monthLabels };
  }, [submissions, daysToShow]);

  // Color mapping based on level
  const getColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-slate-800';
      case 1: return 'bg-emerald-900';
      case 2: return 'bg-emerald-700';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-emerald-300';
      default: return 'bg-slate-800';
    }
  };

  return (
    <div className="w-full bg-slate-900 rounded-2xl p-6 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm">Contribution Activity</h3>
        <span className="text-xs text-slate-500">{submissions.length} contributions in last 6 months</span>
      </div>
      
      <div className="overflow-x-auto no-scrollbar pb-2 relative">
        <div className="min-w-max pl-8 pt-6">
          {/* Month Labels */}
          <div className="absolute top-0 left-8 right-0 flex text-xs text-slate-500 pointer-events-none">
             {monthLabels.map((lbl, idx) => (
               <div key={idx} style={{ position: 'absolute', left: `${lbl.index * (12 + 3)}px` }}>
                 {lbl.month}
               </div>
             ))}
          </div>

          {/* Day of Week Labels */}
          <div className="absolute left-0 top-6 bottom-0 flex flex-col justify-between py-[2px] text-[10px] text-slate-500 font-medium h-[105px]">
            <div className="mt-[15px]">Mon</div>
            <div className="mt-[15px]">Wed</div>
            <div className="mt-[15px]">Fri</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
             {gridCells.map((cell) => (
               <div 
                 key={cell.date}
                 title={`${cell.date}: ${cell.count} contributions`}
                 className={`w-3 h-3 rounded-sm ${getColor(cell.level)} hover:ring-1 ring-white/50 transition-all`}
               />
             ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500 justify-end">
            <span>Less</span>
            <div className="flex gap-[3px]">
              <div className="w-3 h-3 rounded-sm bg-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-900" />
              <div className="w-3 h-3 rounded-sm bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
