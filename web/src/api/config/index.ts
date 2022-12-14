import axios from "axios";

export const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL + "/api" });
export const apiServer = axios.create({ baseURL: process.env.API_URL + "/api" });
