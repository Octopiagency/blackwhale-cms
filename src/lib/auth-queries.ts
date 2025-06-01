import { axiosPrivate } from "./axios-private";

export const loginApi = async (values: LoginCredentials) => {
  const response = await axiosPrivate.post("/admin/auth/authenticate", values);
  if (response.status !== 200) {
    throw new Error(response.data?.message || "Request Failed.");
  }
  return response.data.results;
};

export const refreshTokenApi = async () => {
  const response = await axiosPrivate.post("/admin/auth/refresh-token");
  if (response.status !== 200) {
    throw new Error(response.data?.message || "Request Failed.");
  }
  return response.data.results;
};
export const logoutApi = async () => {
  const response = await axiosPrivate.post("/admin/auth/logout");
  if (response.status !== 200) {
    throw new Error(response.data?.message || "Request Failed.");
  }
  return response.data.results;
};
