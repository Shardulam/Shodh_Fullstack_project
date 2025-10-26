import { Contest, Problem } from "../types";

interface ProblemViewProps {
    contest: Contest;
    selectedProblem: Problem | null;
    onProblemSelect: (problem: Problem) => void;
}

export default function ProblemView({
    contest,
    selectedProblem,
    onProblemSelect,
}: ProblemViewProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Problem Tabs */}
            <div className="border-b dark:border-gray-700">
                <div className="flex space-x-1 p-1">
                    {contest.problems.map((problem) => (
                        <button
                            key={problem.id}
                            onClick={() => onProblemSelect(problem)}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                                selectedProblem?.id === problem.id
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                        >
                            {problem.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Problem Content */}
            {selectedProblem && (
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {selectedProblem.title}
                        </h2>
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                                selectedProblem.difficulty === "Easy"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : selectedProblem.difficulty === "Medium"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                        >
                            {selectedProblem.difficulty}
                        </span>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <div className="text-gray-700 dark:text-gray-300 mb-6">
                            {selectedProblem.description}
                        </div>

                        {/* Sample Test Cases */}
                        {selectedProblem.testCases &&
                            selectedProblem.testCases.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                        Sample Test Cases
                                    </h3>
                                    {selectedProblem.testCases
                                        .slice(0, 2)
                                        .map((testCase, index) => (
                                            <div
                                                key={index}
                                                className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                            >
                                                <div className="mb-2">
                                                    <strong className="text-sm text-gray-700 dark:text-gray-300">
                                                        Input:
                                                    </strong>
                                                    <pre className="mt-1 text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                                                        {testCase.inputData}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <strong className="text-sm text-gray-700 dark:text-gray-300">
                                                        Output:
                                                    </strong>
                                                    <pre className="mt-1 text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                                                        {
                                                            testCase.expectedOutput
                                                        }
                                                    </pre>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}
