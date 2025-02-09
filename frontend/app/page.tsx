import dynamic from 'next/dynamic';
import React from 'react';

const AIWebBrowser = dynamic(() => import('./components/AIWebBrowser'), {
  ssr: false
});

export default function Home() {
  return (
    <main className="min-h-screen">
      <AIWebBrowser />
    </main>
  );
}
