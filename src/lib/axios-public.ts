import axios from "axios";

export const axiosPublic = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_API_BASEURL}`,
  headers: {
    "Content-Type": "application/json",
  },
});
