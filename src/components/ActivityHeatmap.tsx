import React from 'react';

interface HeatmapData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900/40';
    if (count <= 4) return 'bg-green-300 dark:bg-green-800/60';
    if (count <= 6) return 'bg-green-400 dark:bg-green-700/80';
    return 'bg-green-500 dark:bg-green-600';
  };

  const weeks = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  for (let week = 0; week < 53; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + week * 7 + day);
      
      if (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = data.find(d => d.date === dateStr);
        weekData.push({
          date: dateStr,
          count: dayData?.count || 0,
          dayOfWeek: currentDate.getDay(),
        });
      }
    }
    if (weekData.length > 0) {
      weeks.push(weekData);
    }
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-2">
          <div className="w-8"></div>
          {weeks.map((week, weekIndex) => {
            if (weekIndex % 4 === 0 && week[0]) {
              const month = new Date(week[0].date).getMonth();
              return (
                <div key={weekIndex} className="text-xs text-gray-500 dark:text-gray-400 w-3 mr-1">
                  {months[month]}
                </div>
              );
            }
            return <div key={weekIndex} className="w-3 mr-1"></div>;
          })}
        </div>

        {/* Heatmap grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2">
            {dayLabels.map((day, index) => (
              <div key={day} className="h-3 mb-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Activity squares */}
          <div className="flex">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col mr-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = week.find(d => d.dayOfWeek === dayIndex);
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 mb-1 rounded-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:ring-1 hover:ring-gray-400 transition-all ${
                        dayData ? getColorIntensity(dayData.count) : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                      title={dayData ? `${dayData.date}: ${dayData.count} problems` : ''}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-600"></div>
            <div className="w-3 h-3 bg-green-200 dark:bg-green-900/40 rounded-sm border border-gray-200 dark:border-gray-600"></div>
            <div className="w-3 h-3 bg-green-300 dark:bg-green-800/60 rounded-sm border border-gray-200 dark:border-gray-600"></div>
            <div className="w-3 h-3 bg-green-400 dark:bg-green-700/80 rounded-sm border border-gray-200 dark:border-gray-600"></div>
            <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm border border-gray-200 dark:border-gray-600"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}