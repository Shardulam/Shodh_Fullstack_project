const API_BASE_URL = "http://localhost:8081/api";

async function parseJsonOrThrow(res: Response) {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export const apiService = {
    async getContest(contestId: string) {
        const res = await fetch(
            `${API_BASE_URL}/contests/${encodeURIComponent(contestId)}`
        );
        if (!res.ok) throw new Error(`Failed to fetch contest: ${res.status}`);
        return res.json();
    },

    async submitCode(submission: {
        contestId: string | number;
        problemId: string | number;
        code: string;
        language: string;
        username: string;
    }) {
        // ensure numeric ids for backend
        const payload = {
            contestId: Number(submission.contestId),
            problemId: Number(submission.problemId),
            username: submission.username,
            code: submission.code,
            language: submission.language || "java",
        };

        const res = await fetch(`${API_BASE_URL}/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const body = await parseJsonOrThrow(res);
            throw new Error(
                `Submission failed: ${res.status} ${JSON.stringify(body)}`
            );
        }
        const id = await res.json();
        return id;
    },

    async getSubmission(submissionId: string | number) {
        const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}`);
        if (!res.ok)
            throw new Error(`Failed to fetch submission: ${res.status}`);
        return res.json();
    },

    async getLeaderboard(contestId: string | number) {
        const res = await fetch(
            `${API_BASE_URL}/contests/${contestId}/leaderboard`
        );
        if (!res.ok)
            throw new Error(`Failed to fetch leaderboard: ${res.status}`);
        return res.json();
    },
};
