import { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import { userAPI, authAPI } from "../utils/api";
import { format } from "date-fns";

const ProfilePage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verificationSent, setVerificationSent] = useState(false);
    const [isSendingVerification, setIsSendingVerification] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activityData] = await Promise.all([
                    userAPI.getUserStats(),
                    userAPI.getUserActivity(10),
                ]);
                setStats(statsData.stats);
                setActivities(activityData.activities);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleResendVerification = async () => {
        if (!user?.email) return;

        setIsSendingVerification(true);
        try {
            await authAPI.resendVerificationEmail(user.email);
            setVerificationSent(true);
            setTimeout(() => setVerificationSent(false), 5000);
        } catch (error) {
            console.error("Failed to resend verification:", error);
            alert("Failed to send verification email. Please try again.");
        } finally {
            setIsSendingVerification(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                Member since {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently"}
                            </span>
                            {user?.isEmailVerified ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800">
                                    Verified Account
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-800">
                                    Unverified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Verification Warning (Only if unverified) */}
                {!user?.isEmailVerified && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full text-yellow-600 dark:text-yellow-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Verify your email address</h3>
                                <p className="text-yellow-700 dark:text-yellow-300 text-sm">Verify your email to receive daily problem notifications and secure your account.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleResendVerification}
                            disabled={isSendingVerification || verificationSent}
                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${verificationSent
                                    ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                                    : "bg-white dark:bg-gray-800 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-gray-700"
                                }`}
                        >
                            {verificationSent ? "Email Sent!" : isSendingVerification ? "Sending..." : "Resend Verification Email"}
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-400">Problems Created</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats?.problemsCreated || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-400">Lists Created</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats?.listsCreated || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-400">Scheduled Problems</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats?.scheduledProblems || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>

                            {activities.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">No recent activity found.</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Solve some problems to see them here!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activities.map((activity) => (
                                        <div key={activity._id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                            <div className={`mt-1 p-2 rounded-lg ${activity.difficulty === 'Hard' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                    activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    Solved a problem
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>{format(new Date(activity.timestamp), "MMM d, h:mm a")}</span>
                                                    <span>•</span>
                                                    <span className={`${activity.difficulty === 'Hard' ? 'text-red-600 dark:text-red-400' :
                                                            activity.difficulty === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                                                'text-green-600 dark:text-green-400'
                                                        } font-medium`}>
                                                        {activity.difficulty || 'Easy'}
                                                    </span>
                                                    {activity.timeSpent > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{Math.round(activity.timeSpent / 60)}m spent</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
