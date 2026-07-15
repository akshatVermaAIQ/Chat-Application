import { create } from "zustand";
import AXIOS from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =  import.meta.env.MODE==="development"?"http://localhost:8000" :"/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const res = await AXIOS.get("/auth/check");
      set({ authUser: res.data });
      // Added socket io
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await AXIOS.post("/auth/signup", data);
      if (res.status !== 201) {
        throw new Error(res.error);
      }
      set({ authUser: res.data });
      // Added socket io
      get().connectSocket();
      toast.success("Account created successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Something went wrong!");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    try {
      set({ isLoggingIn: true });
      const res = await AXIOS.post("/auth/login", data);
      if (res.status !== 200) {
        throw new Error(res.error);
      }
      set({ authUser: res.data });
      // Added socket io
      get().connectSocket();
      toast.success("Logged in successfully!");
    } catch (error) {
      console.log(error.message);
      toast.error(error?.data?.message || "Something went wrong!");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logOut: async () => {
    try {
      const res = await AXIOS.post("/auth/logout");
      if (res.status !== 200) {
        throw new Error(res.error);
      }
      set({ authUser: null });
      get().disConnectSocket();
      toast.success("Logged out sucessfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong!");
    }
  },
  updateProfile: async (image) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await AXIOS.put("/auth/update-profile", image);
      if (res.status !== 200) {
        throw new Error(res.error);
      }
      set({ authUser: res.data });
      toast.success("profile Updated sucessfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong!");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    // not a user or already connected
    if (!authUser || get().socket?.connected) return;
    console.log(authUser,"user")
    const socket = io(BASE_URL, {
      query: {
        userId: authUser?._id,
      },
    });   
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      console.log(userIds,"userIds")
        set({ onlineUsers: userIds });
    });
  },

  disConnectSocket: () => {
    if (get().socket?.connected) {
      console.log("Disconnecting socket...");
      get().socket.disconnect();
      set({ socket: null });
    } else {
      console.log("Socket is not connected.");
    }
  },
}));
