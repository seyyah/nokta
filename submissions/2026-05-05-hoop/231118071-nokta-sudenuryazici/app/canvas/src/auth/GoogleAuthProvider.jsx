import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';

// Google Cloud Console'dan alınan OAuth2 Client ID
// Kullanıcı kendi Client ID'sini buraya yazmalı veya .env'den okumalı
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const SCOPES = 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly';

export const GoogleAuthContext = createContext(null);

export default function GoogleAuthProvider({ children }) {
  const [user, setUser] = useState(null);        // { name, email, picture }
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const tokenClientRef = useRef(null);

  // GIS yüklendikten sonra token client'ı başlat
  useEffect(() => {
    const initGIS = () => {
      if (!window.google?.accounts?.oauth2) {
        // GIS henüz yüklenmedi, biraz bekle
        setTimeout(initGIS, 200);
        return;
      }

      if (!CLIENT_ID) {
        setError('VITE_GOOGLE_CLIENT_ID ayarlanmamış. .env dosyasına ekleyin.');
        setIsLoading(false);
        return;
      }

      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            setError(tokenResponse.error);
            return;
          }
          setAccessToken(tokenResponse.access_token);
          // Token aldıktan sonra kullanıcı bilgilerini çek
          fetchUserInfo(tokenResponse.access_token);
        },
      });

      setIsLoading(false);
    };

    initGIS();
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser({
        name: data.name,
        email: data.email,
        picture: data.picture,
      });
    } catch (err) {
      console.error('User info fetch error:', err);
    }
  };

  const login = useCallback(() => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    }
  }, []);

  const logout = useCallback(() => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        setUser(null);
        setAccessToken(null);
      });
    }
  }, [accessToken]);

  const value = {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated: !!accessToken,
    login,
    logout,
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
}
