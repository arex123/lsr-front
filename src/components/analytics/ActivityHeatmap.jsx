import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import { analyticsAPI } from '../../utils/api';

const ActivityHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch last 365 days
                const endDate = new Date();
                const startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);

                const response = await analyticsAPI.getHeatmapData(
                    startDate.toISOString(),
                    endDate.toISOString()
                );

                if (response.success) {
                    setHeatmapData(response.data);
                }
            } catch (error) {
                console.error('Error fetching heatmap:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Activity Calendar
            </h3>

            <div className="w-full overflow-x-auto">
                <div className="min-w-[800px]">
                    <CalendarHeatmap
                        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                        endDate={new Date()}
                        values={heatmapData}
                        classForValue={(value) => {
                            if (!value) {
                                return 'color-empty';
                            }
                            // Scale color intensity based on count
                            return `color-scale-${Math.min(value.count, 4)}`;
                        }}
                        tooltipDataAttrs={(value) => {
                            if (!value || !value.date) {
                                return null;
                            }
                            return {
                                'data-tooltip-id': 'heatmap-tooltip',
                                'data-tooltip-content': `${value.date}: ${value.count} problems solved`,
                            };
                        }}
                        showWeekdayLabels={true}
                    />
                </div>
            </div>

            <Tooltip id="heatmap-tooltip" />

            <style>{`
        .react-calendar-heatmap text {
          font-size: 10px;
          fill: #9ca3af;
        }
        .react-calendar-heatmap .color-empty {
          fill: #f3f4f6; /* gray-100 */
        }
        .dark .react-calendar-heatmap .color-empty {
          fill: #374151; /* gray-700 */
        }
        
        /* Light Mode Colors (Green scale) */
        .react-calendar-heatmap .color-scale-1 { fill: #bbf7d0; }
        .react-calendar-heatmap .color-scale-2 { fill: #86efac; }
        .react-calendar-heatmap .color-scale-3 { fill: #4ade80; }
        .react-calendar-heatmap .color-scale-4 { fill: #22c55e; }

        /* Dark Mode Colors */
        .dark .react-calendar-heatmap .color-scale-1 { fill: #064e3b; }
        .dark .react-calendar-heatmap .color-scale-2 { fill: #065f46; }
        .dark .react-calendar-heatmap .color-scale-3 { fill: #047857; }
        .dark .react-calendar-heatmap .color-scale-4 { fill: #059669; }
      `}</style>
        </div>
    );
};

export default ActivityHeatmap;
