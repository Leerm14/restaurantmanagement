import axios from "axios";
import { auth } from "../firebaseConfig";
const apiClient = axios.create({
  baseURL: "https://restaurant-back-end-production.up.railway.app/",
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
