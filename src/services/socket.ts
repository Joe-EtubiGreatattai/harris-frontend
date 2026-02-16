import { io } from 'socket.io-client';

// Use environment variable or default to localhost
// Use current hostname to ensure connectivity across devices in the same network
const SOCKET_URL = 'https://harris-backend.onrender.com';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling'], // Try websocket first
});
