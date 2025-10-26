import { useState, useEffect, useRef } from "react";
import { apiService } from "../services/api";
import { Problem, Submission } from "../types";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
    problem: Problem;
    contestId: string;
}

export default function CodeEditor({ problem, contestId }: CodeEditorProps) {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("java");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear previous polling when problem changes
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        setSubmission(null);

        // cleanup on unmount
        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [problem.id]);

    useEffect(() => {
        setCode(getDefaultCode(language));
    }, [language]);

    const getDefaultCode = (lang: string) => {
        const templates: { [key: string]: string } = {
            java: `public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}`,
            python: `# Your code here
def solution():
    pass

if __name__ == "__main__":
    solution()`,
            cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
        };
        return templates[lang] || "";
    };

    const handleSubmit = async () => {
        if (!code.trim()) return;

        setIsSubmitting(true);
        try {
            const username = localStorage.getItem("username");
            if (!username) throw new Error("User not found");

            const submissionId = await apiService.submitCode({
                contestId,
                problemId: problem.id,
                code,
                language,
                username,
            });

            // api returns the numeric id. Normalize into Submission-like object for UI
            const stub: Submission = {
                id: String(submissionId),
                userId: username,
                problemId: problem.id,
                code,
                language,
                status: "Pending",
                createdAt: new Date().toISOString(),
            };

            setSubmission(stub);
            startPolling(stub.id);
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const startPolling = (submissionId: string) => {
        const interval = setInterval(async () => {
            try {
                const updatedSubmission = await apiService.getSubmission(
                    submissionId
                );
                setSubmission(updatedSubmission);

                // Normalize various status representations (backend uses enums like ACCEPTED, WRONG_ANSWER)
                const s = String(updatedSubmission.status).toUpperCase();
                const isFinal =
                    s.includes("ACCEPT") ||
                    s.includes("WRONG") ||
                    s.includes("TIME") ||
                    s.includes("RUNTIME") ||
                    s.includes("COMPIL") ||
                    s.includes("ERROR") ||
                    s.includes("TIMED");
                if (isFinal) {
                    clearInterval(interval);
                    if (pollRef.current) pollRef.current = null;
                }
            } catch (error) {
                console.error("Polling failed:", error);
                clearInterval(interval);
                if (pollRef.current) pollRef.current = null;
            }
        }, 2000);
        pollRef.current = interval;
    };

    const mapStatus = (raw: unknown) => {
        if (!raw)
            return {
                label: "Pending",
                color: "text-gray-600",
                canonical: "PENDING",
            };
        const s = String(raw).toUpperCase();
        if (s.includes("ACCEPT"))
            return {
                label: "Accepted",
                color: "text-green-600",
                canonical: "ACCEPTED",
            };
        if (s.includes("WRONG"))
            return {
                label: "Wrong Answer",
                color: "text-red-600",
                canonical: "WRONG_ANSWER",
            };
        if (s.includes("COMPIL"))
            return {
                label: "Compilation Error",
                color: "text-red-600",
                canonical: "COMPILATION_ERROR",
            };
        if (s.includes("TIME") || s.includes("TIMED"))
            return {
                label: "Time Limit Exceeded",
                color: "text-yellow-600",
                canonical: "TIMED_OUT",
            };
        if (s.includes("RUNTIME"))
            return {
                label: "Runtime Error",
                color: "text-red-600",
                canonical: "RUNTIME_ERROR",
            };
        if (s.includes("RUNNING"))
            return {
                label: "Running",
                color: "text-blue-600",
                canonical: "RUNNING",
            };
        if (s.includes("ERROR"))
            return {
                label: "Error",
                color: "text-red-600",
                canonical: "ERROR",
            };
        return { label: String(raw), color: "text-gray-600", canonical: s };
    };

    const getStatusColor = (status: string) => mapStatus(status).color;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Code Editor
                    </h3>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>

                <div className="relative">
                    <div className="relative">
                        <Editor
                            height="320px"
                            defaultLanguage={language}
                            language={language}
                            value={code}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontFamily:
                                    'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
                            }}
                            onChange={(value) => setCode(String(value || ""))}
                            onMount={() => {
                                // editor mounted
                            }}
                        />
                        <div className="absolute right-2 top-2 text-xs text-gray-500">
                            Lines: {code.split("\n").length}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleSubmit}
                            disabled={
                                isSubmitting ||
                                !code.trim() ||
                                (submission
                                    ? ["RUNNING", "PENDING"].includes(
                                          mapStatus(submission.status).canonical
                                      )
                                    : false)
                            }
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Code"}
                        </button>
                        <button
                            onClick={() => {
                                // reset to default template
                                setCode(getDefaultCode(language));
                            }}
                            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                        >
                            Reset
                        </button>
                    </div>

                    {submission && (
                        <div className="flex flex-col items-start space-y-3 w-full">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Status:
                                </span>
                                <span
                                    className={`text-sm font-medium ${getStatusColor(
                                        submission.status
                                    )}`}
                                >
                                    {mapStatus(submission.status).label}
                                </span>
                                {mapStatus(submission.status).canonical ===
                                    "RUNNING" && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 ml-2"></div>
                                )}
                            </div>

                            <div className="w-full">
                                {mapStatus(submission.status).canonical ===
                                "ACCEPTED" ? (
                                    <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
                                        Accepted ✓ All tests passed
                                    </div>
                                ) : (
                                    <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48 dark:bg-gray-900">
                                        {submission.resultMessage ||
                                            "No details available."}
                                    </pre>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
