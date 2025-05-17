import axios from "axios";

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
  const response = await axios.post<AiAnswerResponse>("/chat", data);
  return response.data;
}
