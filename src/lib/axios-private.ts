import axios from "axios";
import { dataLocalStorage, getLocalStorage } from "../helper/public-functions";

axios.defaults.baseURL = `${import.meta.env.VITE_SERVER_API_BASEURL}`;

axios.interceptors.request.use(
  async (config) => {
    // Get the latest user data on each request
    const userData = getLocalStorage(dataLocalStorage.userinfo);
    const accessToken = userData?.token;

    if (accessToken) {
      config.headers.set("token", accessToken);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(
      "error?.response?.data?.message : ",
      error?.response?.data?.message
    );
    return Promise.reject(error);
  }
);

export const axiosPrivate = axios;
