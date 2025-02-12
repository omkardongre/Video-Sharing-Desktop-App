import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import './App.css';
import { Toaster } from 'sonner';
import ControlLayout from './layouts/ControlLayout';
import AuthButton from './components/global/AuthButton';
import Widget from './components/global/Widget';

const client = new QueryClient();

function App() {
  const { isSignedIn } = useUser();
  const prevSignedInRef = useRef(isSignedIn);

  useEffect(() => {
    if (isSignedIn && !prevSignedInRef.current) {
      window.ipcRenderer.send('login-success');
    }

    if (!isSignedIn && prevSignedInRef.current) {
      window.ipcRenderer.send('logout-success');
    }
    prevSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  return (
    <QueryClientProvider client={client}>
      <ControlLayout>
        <AuthButton />
        <Widget />
      </ControlLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;