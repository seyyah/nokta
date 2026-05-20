import { useContext } from 'react';
import { GoogleAuthContext } from './GoogleAuthProvider';

/**
 * Google OAuth2 hook.
 *
 * Kullanım:
 *   const { user, accessToken, isAuthenticated, login, logout } = useGoogleAuth();
 *
 * Döndürdüğü değerler:
 *   - user: { name, email, picture } veya null
 *   - accessToken: Google OAuth2 access token (string) veya null
 *   - isAuthenticated: Kullanıcı giriş yapmış mı (boolean)
 *   - isLoading: GIS henüz yükleniyor mu (boolean)
 *   - error: Hata mesajı (string) veya null
 *   - login: Google ile giriş yap fonksiyonu
 *   - logout: Çıkış yap fonksiyonu
 */
export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
}

export default useGoogleAuth;
