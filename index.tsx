import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Suspended } from './components/Suspended';

// Administrative Override: Set to true to suspend and block the entire site, false to restore
const isSuspended = true;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isSuspended ? <Suspended /> : <App />}
  </React.StrictMode>
);