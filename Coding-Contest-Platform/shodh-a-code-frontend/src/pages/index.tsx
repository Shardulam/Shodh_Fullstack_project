import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function JoinContest() {
    const [contestId, setContestId] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contestId || !username) {
            setError("Please enter both contest ID and username.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            localStorage.setItem("username", username);
            localStorage.setItem("userId", `user_${Date.now()}`);

            router.push(`/contest/${contestId}`);
        } catch (err) {
            setError("Failed to join contest. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <Image
                            src="/next.svg"
                            alt="Shodh-a-Code"
                            width={120}
                            height={30}
                            className="mx-auto mb-4 dark:invert"
                        />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Shodh-a-Code
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Join a coding contest and compete with others!
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                        <form
                            onSubmit={handleJoin}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="contestId"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Contest ID (use 1 for demo)
                                </label>
                                <input
                                    type="text"
                                    id="contestId"
                                    value={contestId}
                                    onChange={(e) =>
                                        setContestId(e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter contest ID (use 1 for demo)"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter your username"
                                />
                            </div>
                            {error && (
                                <div className="text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? "Joining..." : "Join Contest"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
