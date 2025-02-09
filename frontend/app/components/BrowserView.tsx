
import React, { useState, useEffect } from 'react';

interface BrowserViewProps {
  sessionId: string;
  sendMessage: (message: any) => boolean;
  screenshotUrl: string | null;
}

const BrowserView: React.FC<BrowserViewProps> = ({
  sessionId,
  sendMessage,
  screenshotUrl
}) => {
  const [url, setUrl] = useState('https://google.com');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(Boolean(sessionId));
  }, [sessionId]);

  const handleNavigation = () => {
    sendMessage({
      type: 'navigate',
      details: { url },
    });
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
          />
          <button
            onClick={handleNavigation}
            className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Navigate
          </button>
        </div>

        {screenshotUrl && (
          <div className="w-full overflow-hidden rounded-lg border">
            <img
              src={screenshotUrl}
              alt="Browser Screenshot"
              className="w-full h-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserView;
