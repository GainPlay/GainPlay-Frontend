import {SigninResponse, SignupResponse } from "@/types";
import { AxiosResponse } from "axios";
import apiClient from "./apiClient";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/utils/constants/index";

export const headers = () => {
  const tokens = getTokens();
  if (tokens.accessToken) {
    return {
      Authorization: `Bearer ${tokens.accessToken}`,
    };
  }
  return {};
};

// export const refreshTokenHeaders = () => {
//   const tokens = getTokens();
//   if (tokens.refreshToken) {
//     return {
//       Authorization: `Bearer ${tokens.refreshToken}`
//     };
//   }
//   return {};
// };

export const getTokens = () => {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    // refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
  };
};

export const saveTokens = ({
  accessToken,
}: // refreshToken
{
  accessToken: string;
  // refreshToken: string;
}) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  // localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const resetTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const signin = async (
  email: string,
  password: string
): Promise<AxiosResponse<SigninResponse>> => {
  return await apiClient.post("/auth/login", { email, password });
};

// export const logout = async () => {
//   return await apiClient.post(
//     "/auth/logout",
//     {},
//     { headers: refreshTokenHeaders() }
//   );
// };

export const signup = async (
  username: string,
  email: string,
  password: string
): Promise<AxiosResponse<SignupResponse>> => {
  return await apiClient.post("/auth/register", {
    name: username,
    email,
    password,
  });
};

// export const googleSignIn = async (
//   credentialResponse: CredentialResponse
// ): Promise<AxiosResponse<GoogleSignInResponse>> => {
//   return await apiClient.get("/auth/google", {
//     credentialResponse
//   });
// };

// export const refresh = async (): Promise<AxiosResponse<RefreshResponse>> => {
//   return await apiClient.post(
//     "/auth/refresh",
//     {},
//     {
//       headers: refreshTokenHeaders()
//     }
//   );
// };

// export const isAuthenticated = () => {
//   const tokens = getTokens();
//   return tokens.accessToken !== null;
// };
