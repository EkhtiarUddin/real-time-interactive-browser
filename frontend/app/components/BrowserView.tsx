import React, { useState, useEffect, useRef } from 'react';

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
  const [inputText, setInputText] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);

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
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      sendMessage({
        type: 'click',
        details: { x, y },
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleInputSubmit = () => {
    sendMessage({
      type: 'type',
      details: { text: inputText },
    });
    setInputText('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="w-full max-w-5xl space-y-12">
        {/* Title */}
        <h1 className="text-6xl font-bold text-center text-gray-800">
          AI Real-time Interactive Browser
        </h1>

        {/* Connection Status */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className={`w-5 h-5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-2xl text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Navigation Row */}
        <div className="flex space-x-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-8 py-4 text-2xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter URL"
          />
          <button
            onClick={handleNavigation}
            className="px-12 py-4 text-2xl text-white bg-blue-500 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Navigate
          </button>
        </div>

        {/* Input Row */}
        <div className="flex space-x-4 mt-8">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 px-8 py-4 text-2xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type text to input"
          />
          <button
            onClick={handleInputSubmit}
            className="px-12 py-4 text-2xl text-white bg-blue-500 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Send Text
          </button>
        </div>

        {/* Browser Screenshot */}
        {screenshotUrl && (
          <div className="w-full overflow-hidden rounded-xl border-2 shadow-xl mt-8">
            <img
              ref={imageRef}
              src={screenshotUrl}
              alt="Browser Screenshot"
              className="w-full h-auto cursor-pointer"
              onClick={handleClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserView;