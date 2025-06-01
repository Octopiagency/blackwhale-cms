// errorHandler.js

import { toast } from "react-toastify";
import { Logout } from "src/store/data/user/actionsUser";

export const handleAxiosError = (error, dispatch) => {
  const isTokenExpired = error?.response?.data?.message === "Token expired";
  const networkError = error.code === "ERR_NETWORK";
  if (error?.response) {
    if (networkError) {
      toast.error("Network Error");
    }
    if (
      error?.response?.data?.message.includes("Unauthorized") ||
      isTokenExpired
    ) {
      dispatch(Logout({ navigate: null }));
    }
  }
};
