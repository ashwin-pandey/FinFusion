import React, { useEffect } from 'react';

interface GoogleLoginProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
}

// Declare global google type
declare global {
  interface Window {
    google?: any;
  }
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
          }
        );
      }
    };

    const handleCredentialResponse = (response: any) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else if (onError) {
        onError();
      }
    };

    // Check if Google client ID is configured
    if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured. Set REACT_APP_GOOGLE_CLIENT_ID in .env');
      return;
    }

    loadGoogleScript();

    return () => {
      // Cleanup
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [onSuccess, onError]);

  return (
    <div>
      {!process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
        <div style={{
          padding: '12px',
          background: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong>Google Sign-In not configured</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
            Add REACT_APP_GOOGLE_CLIENT_ID to your .env file to enable Google OAuth
          </p>
        </div>
      ) : (
        <div id="googleSignInButton"></div>
      )}
    </div>
  );
};

export default GoogleLogin;


