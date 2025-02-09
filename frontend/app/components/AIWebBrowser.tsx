'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import BrowserView from './BrowserView';
import ErrorDisplay from './ErrorDisplay';
import WebSocketService from '../../services/webSocketService';

const AIWebBrowser = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocketService | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/start-session', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize browser session');
      }

      const data = await response.json();
      setSessionId(data.session_id);
      
      const ws = new WebSocketService(
        `${process.env.NEXT_PUBLIC_WS_URL}/ws/${data.session_id}`,
        {
          onOpen: () => {
            setLoading(false);
            setError(null);
          },
          onError: () => {
            setError('WebSocket connection failed');
            setLoading(false);
          },
          onClose: () => {
            setError('Connection closed');
            setLoading(false);
          },
          onMessage: handleWebSocketMessage,
        }
      );

      ws.connect();
      setWebSocket(ws);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLoading(false);
    }
  };

  const handleWebSocketMessage = (event: MessageEvent) => {
    if (event.data instanceof Blob) {
      const newUrl = URL.createObjectURL(event.data);
      setScreenshotUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return newUrl;
      });
    } else {
      try {
        const message = JSON.parse(event.data);
        if (message.error) {
          setError(message.error);
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    }
  };

  useEffect(() => {
    initializeSession();
    return () => {
      webSocket?.close();
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl);
      }
    };
  }, []);

  const sendWebSocketMessage = useCallback(
    (message: any) => {
      return webSocket?.send(message) ?? false;
    },
    [webSocket]
  );

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-4">
      <ErrorDisplay error={error} />
      {sessionId && (
        <BrowserView
          sessionId={sessionId}
          sendMessage={sendWebSocketMessage}
          screenshotUrl={screenshotUrl}
        />
      )}
    </Box>
  );
};

export default AIWebBrowser;
