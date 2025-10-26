export interface Contest {
    id: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    problems: Problem[];
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    testCases: TestCase[];
}

export interface TestCase {
    inputData: string;
    expectedOutput: string;
}

export interface User {
    id: string;
    username: string;
}

export interface Submission {
    id: string;
    userId: string;
    problemId: string;
    code: string;
    language: string;
    status:
        | "Pending"
        | "Running"
        | "Accepted"
        | "Wrong Answer"
        | "Time Limit Exceeded"
        | "Runtime Error";
    createdAt: string;
    // Optional extra details returned from backend (result messages, compilation output, etc.)
    resultMessage?: string;
}

export interface LeaderboardEntry {
    userId: string;
    username: string;
    score: number;
    solvedProblems: number;
    lastSubmissionTime: string;
}
