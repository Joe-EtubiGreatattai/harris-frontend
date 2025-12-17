import { io } from 'socket.io-client';

// Use environment variable or default to localhost
const SOCKET_URL = 'http://localhost:4000';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling'], // Try websocket first
});
