import { SigninResponse, SignupResponse } from "@/types";
import axios, { AxiosResponse } from "axios";
import { ACCESS_TOKEN_KEY } from "@/utils/constants/index";

export const headers = () => {
  const tokens = getTokens();
  if (tokens.accessToken) {
    return {
      Authorization: `Bearer ${tokens.accessToken}`
    };
  }
  return {};
};

export const getTokens = () => {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY)
  };
};

export const saveTokens = ({ accessToken }: { accessToken: string }) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const setDefaultAxiosConfig = () => {
  axios.defaults.headers.Authorization = `Bearer ${getTokens().accessToken}`;
};

export const resetTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const signin = async (
  email: string,
  password: string
): Promise<AxiosResponse<SigninResponse>> => {
  return await axios.post("/auth/login", { email, password });
};

// export const logout = async () => {
//   return await axios.post(
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
  return await axios.post("/auth/register", {
    name: username,
    email,
    password
  });
};

// export const googleSignIn = async (
//   credentialResponse: CredentialResponse
// ): Promise<AxiosResponse<GoogleSignInResponse>> => {
//   return await axios.get("/auth/google", {
//     credentialResponse
//   });
// };

// export const refresh = async (): Promise<AxiosResponse<RefreshResponse>> => {
//   return await axios.post(
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
