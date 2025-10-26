import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProblemView from "../../components/ProblemView";
import CodeEditor from "../../components/CodeEditor";
import Leaderboard from "../../components/Leaderboard";
import { apiService } from "../../services/api";
import { Contest, Problem } from "../../types";

export default function ContestPage() {
    const router = useRouter();
    const { contestId } = router.query;
    const [contest, setContest] = useState<Contest | null>(null);
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) {
            router.push("/");
            return;
        }
        setUsername(storedUsername);

        if (contestId && typeof contestId === "string") {
            fetchContest(contestId);
        }
    }, [contestId, router]);

    const fetchContest = async (id: string) => {
        try {
            const contestData = await apiService.getContest(id);
            setContest(contestData);
            if (contestData.problems && contestData.problems.length > 0) {
                setSelectedProblem(contestData.problems[0]);
            }
        } catch (err) {
            setError("Failed to load contest");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading contest...</div>
            </div>
        );
    }

    if (error || !contest) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">
                        {error || "Contest not found"}
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {contest.name}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Welcome, {username}
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => router.push("/")}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                Leave Contest
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Problem List & Problem View */}
                    <div className="lg:col-span-2">
                        <ProblemView
                            contest={contest}
                            selectedProblem={selectedProblem}
                            onProblemSelect={setSelectedProblem}
                        />
                    </div>

                    {/* Code Editor */}
                    <div className="lg:col-span-2">
                        {selectedProblem && (
                            <CodeEditor
                                problem={selectedProblem}
                                contestId={contest.id}
                            />
                        )}
                    </div>
                    {/* Leaderboard */}
                    <div className="lg:col-span-1">
                        <Leaderboard contestId={contest.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
