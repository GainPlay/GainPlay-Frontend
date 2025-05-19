import axios from "axios";
import { headers } from "./authService";
// import { saveTokens, refresh } from "./authService";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL + "/api",
  headers: {
    "Content-type": "application/json",
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiIxMjNAZ21haWwuY29tIiwiaWF0IjoxNzQ3NjgzNjcwLCJleHAiOjE3NDc2ODcyNzB9.7vQIbyfq0yTj7h1vi3HrtlUqv3tLY4Nttz4TUo8J860`,
    
  },
});

// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response && error.response.data === "Unauthorized") {
//       try {
//         const accessToken = await refreshTokens();
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         originalRequest._retry = true;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         return Promise.reject(refreshError);
//       }
//     }
//     return error;
//   }
// );

// async function refreshTokens() {
//   const refreshResponse = await refresh();
//   const { accessToken, refreshToken } = refreshResponse.data;
//   saveTokens({ accessToken, refreshToken });
//   return accessToken;
// }

export default apiClient;