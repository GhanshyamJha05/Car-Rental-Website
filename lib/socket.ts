import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

// Car availability events
export const joinCarRoom = (carId: string) => {
  if (socket) {
    socket.emit('join_car', carId);
  }
};

export const leaveCarRoom = (carId: string) => {
  if (socket) {
    socket.emit('leave_car', carId);
  }
};

// Event listeners
export const onCarAvailable = (callback: (data: { carId: string; timestamp: Date }) => void) => {
  if (socket) {
    socket.on('car_available', callback);
  }
};

export const offCarAvailable = (callback: Function) => {
  if (socket) {
    socket.off('car_available', callback);
  }
};

export const onCarUnavailable = (callback: (data: { carId: string; timestamp: Date }) => void) => {
  if (socket) {
    socket.on('car_unavailable', callback);
  }
};

export const offCarUnavailable = (callback: Function) => {
  if (socket) {
    socket.off('car_unavailable', callback);
  }
};

export const onBookingCreated = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('booking_created', callback);
  }
};

export const offBookingCreated = (callback: Function) => {
  if (socket) {
    socket.off('booking_created', callback);
  }
};

export const onBookingCancelled = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('booking_cancelled', callback);
  }
};

export const offBookingCancelled = (callback: Function) => {
  if (socket) {
    socket.off('booking_cancelled', callback);
  }
};

export const onPaymentSuccess = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('payment_success', callback);
  }
};

export const offPaymentSuccess = (callback: Function) => {
  if (socket) {
    socket.off('payment_success', callback);
  }
};

export const onNewBooking = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('new_booking', callback);
  }
};

export const offNewBooking = (callback: Function) => {
  if (socket) {
    socket.off('new_booking', callback);
  }
};

