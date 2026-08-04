import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../lib/api';

export function useSocket(onDealUpdated?: (updatedDeal: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      socket.emit('joinPipeline');
    });

    if (onDealUpdated) {
      socket.on('dealUpdated', (updatedDeal) => {
        console.log('Received dealUpdated event via WebSocket:', updatedDeal);
        onDealUpdated(updatedDeal);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [onDealUpdated]);

  return socketRef.current;
}
