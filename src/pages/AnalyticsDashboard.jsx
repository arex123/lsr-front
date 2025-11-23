import StreakStats from '../components/analytics/StreakStats';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import TrendsCharts from '../components/analytics/TrendsCharts';

const AnalyticsDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Progress
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Track your consistency and problem-solving trends over time.
                </p>
            </div>

            {/* Top Stats Cards */}
            <StreakStats />

            {/* Activity Heatmap */}
            <div className="mb-8">
                <ActivityHeatmap />
            </div>

            {/* Charts Section */}
            <TrendsCharts />
        </div>
    );
};

export default AnalyticsDashboard;
