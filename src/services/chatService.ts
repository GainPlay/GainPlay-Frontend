import apiClient from './apiClient';

export interface AiAnswerRequest {
    userId: number;
    message: string;
}

export interface AiAnswerResponse {
    answer: string;
    dateTime: string;
}

export async function getAiAnswer(
    data: AiAnswerRequest
): Promise<AiAnswerResponse> {
    const response = await apiClient.post<AiAnswerResponse>('/chat', data);
    return response.data;
}