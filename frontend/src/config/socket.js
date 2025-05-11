import socket from "socket.io-client";

let SocketInstance = null;

export const InitializeSocket = (projectId) => {
  SocketInstance = socket(import.meta.env.VITE_API_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId,
    },
  });
  return SocketInstance;
};

export const receiveMessage = (eventName, callback) => {
  SocketInstance.on(eventName, callback);
};
export const sendMessage = (eventName, data) => {
  SocketInstance.emit(eventName, data);
};
