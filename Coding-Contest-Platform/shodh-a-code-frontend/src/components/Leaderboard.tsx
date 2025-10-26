import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { LeaderboardEntry } from "../types";

interface LeaderboardProps {
    contestId: string;
}

export default function Leaderboard({ contestId }: LeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();

        // Poll leaderboard every 30 seconds
        const interval = setInterval(fetchLeaderboard, 30000);

        return () => clearInterval(interval);
    }, [contestId]);

    const fetchLeaderboard = async () => {
        try {
            const data = await apiService.getLeaderboard(contestId);
            setLeaderboard(data);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Leaderboard
                </h3>
                <div className="animate-pulse">
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Leaderboard
                </h3>

                <div className="space-y-2">
                    {leaderboard.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No submissions yet
                        </p>
                    ) : (
                        leaderboard.map((entry, index) => (
                            <div
                                // ensure a stable unique key even if userId is missing or duplicated
                                key={`${entry.userId ?? "user"}-${index}`}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                    index === 0
                                        ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                                        : index === 1
                                        ? "bg-gray-50 dark:bg-gray-700/50"
                                        : index === 2
                                        ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                                        : "bg-gray-25 dark:bg-gray-700/25"
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span
                                        className={`text-sm font-bold ${
                                            index === 0
                                                ? "text-yellow-600 dark:text-yellow-400"
                                                : index === 1
                                                ? "text-gray-600 dark:text-gray-400"
                                                : index === 2
                                                ? "text-orange-600 dark:text-orange-400"
                                                : "text-gray-500 dark:text-gray-500"
                                        }`}
                                    >
                                        #{index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {entry.username}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {entry.solvedProblems} solved
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {entry.score}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
