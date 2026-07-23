import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components -- co-located with WebSocketProvider by design; splitting into a separate file would mean touching every importer for a Fast Refresh nicety only
export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [lastUpdate, setLastUpdate] = useState({ entity: null, timestamp: 0 });

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
    // Remove '/api' from the end of the base URL to connect to '/ws'
    const wsUrl = API_BASE_URL.replace('/api', '/ws');

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      debug: () => {
        // console.log(str); // Uncomment to debug STOMP
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket');
      client.subscribe('/topic/updates', (message) => {
        if (message.body) {
          console.log('WebSocket received update for entity:', message.body);
          setLastUpdate({
            entity: message.body,
            timestamp: Date.now()
          });
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ stompClient, lastUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
};
