import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let socket = null;

export const initiateSocketConnection = () => {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });
  console.log('Connecting socket...');
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToContestLeaderboard = (contestId, userId, onUpdate) => {
  if (!socket) initiateSocketConnection();
  
  socket.emit('join_contest', { contestId, userId });
  socket.on('leaderboard_update', (leaderboard) => {
    onUpdate(leaderboard);
  });
};

export const unsubscribeFromContestLeaderboard = (contestId, userId) => {
  if (socket) {
    socket.emit('leave_contest', { contestId, userId });
    socket.off('leaderboard_update');
  }
};
