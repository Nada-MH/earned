import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SkillData {
  name: string;
  score: number; // 0-100
}

interface SkillRadarChartProps {
  data: SkillData[];
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 w-full flex items-center justify-center text-slate-500">No skill data available</div>;
  }
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Skills"
            dataKey="score"
            stroke="#10b981"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
