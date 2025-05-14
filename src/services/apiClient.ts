import axios from "axios";
// import { saveTokens, refresh } from "./authService";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL + "/api",
  headers: {
    "Content-type": "application/json"
  }
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