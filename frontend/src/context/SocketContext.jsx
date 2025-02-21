import { createContext, useContext } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const socket = io('https://medical-appointment-c94a.onrender.com');

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
} 