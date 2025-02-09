import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress } from '@mui/material';

interface BrowserViewProps {
  sessionId: string;
  sendMessage: (message: any) => boolean;
  screenshotUrl: string | null;
  isProcessing: boolean;
}

const BrowserView: React.FC<BrowserViewProps> = ({
  sessionId,
  sendMessage,
  screenshotUrl,
  isProcessing
}) => {
  const [url, setUrl] = useState('https://google.com');
  const [isConnected, setIsConnected] = useState(false);
  const [inputText, setInputText] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);
  const [lastClickCoords, setLastClickCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setIsConnected(Boolean(sessionId));
  }, [sessionId]);

  const handleNavigation = () => {
    sendMessage({
      type: 'navigate',
      details: { url },
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (imageRef.current && !isProcessing) {
      const rect = imageRef.current.getBoundingClientRect();
      const scale = imageRef.current.naturalWidth / rect.width;

      const x = (e.clientX - rect.left) * scale;
      const y = (e.clientY - rect.top) * scale;

      setLastClickCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      sendMessage({
        type: 'click',
        details: {
          x: Math.round(x),
          y: Math.round(y)
        },
      });

      setTimeout(() => setLastClickCoords(null), 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleInputSubmit = () => {
    if (inputText.trim()) {
      sendMessage({
        type: 'type',
        details: {
          text: inputText.trim(),
          preventEnter: true
        },
      });
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          AI Real-time Interactive Browser
        </h1>

        <div className="flex items-center justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter URL"
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleNavigation}
            disabled={isProcessing}
            className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Navigate
          </button>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type text to input"
          />
          <button
            onClick={handleInputSubmit}
            disabled={isProcessing || !inputText.trim()}
            className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send Text
          </button>
        </div>

        <div className="relative w-full overflow-hidden rounded-lg border">
          {screenshotUrl && (
            <>
              <img
                ref={imageRef}
                src={screenshotUrl}
                alt="Browser Screenshot"
                className={`w-full h-auto ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}`}
                onClick={handleClick}
              />
              {lastClickCoords && (
                <div
                  className="absolute w-4 h-4 bg-blue-500 rounded-full opacity-50 animate-ping"
                  style={{
                    left: lastClickCoords.x - 8,
                    top: lastClickCoords.y - 8,
                  }}
                />
              )}
            </>
          )}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
              <CircularProgress />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowserView;