import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let socket = null;

export const initiateSocketConnection = () => {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: { token: localStorage.getItem('token') },
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
  
  socket.off('leaderboard_update');
  socket.on('leaderboard_update', (leaderboard) => {
    onUpdate(leaderboard);
  });
  socket.emit('join_contest', { contestId });
};

export const unsubscribeFromContestLeaderboard = (contestId, userId) => {
  if (socket) {
    socket.emit('leave_contest', { contestId, userId });
    socket.off('leaderboard_update');
  }
};
