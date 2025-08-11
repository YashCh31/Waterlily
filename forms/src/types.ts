// API Response types

export interface User {
    id: number;
    created_at: string;
}

export interface Question {
    id: number;
    text: string;
    title: string;
    description: string;
    input_type: 'text' | 'number' | 'email' | 'tel' | 'textarea';
    created_at: string;
    field: string;
}

export interface Answer {
    question_id: number;
    answer: string;
}

export interface UserAnswer {
    id: number;
    user_id: number;
    question_id: number;
    answer: string;
    created_at: string;
    title: string;
    input_type: 'text' | 'number' | 'email' | 'tel' | 'textarea';
    description: string;
    field: string;
}

export interface SubmitAnswerRequest {
    user_id?: number;
    answer: Answer[];
}

export interface SubmitAnswerResponse {
    id: number;
    user_id: number;
    question_id: number;
    answer: string;
    created_at: string;
}

// Component State Types
export interface QuestionsState {
    questions: Question[];
    answers: Record<number, string>;
    loading: boolean;
    submitting: boolean;
    userId: number | null;
}

export interface ResultState {
    userAnswers: UserAnswer[];
    loading: boolean;
    error: string | null;
}