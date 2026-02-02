import Cookies from 'js-cookie';

export const authService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get('access_token');
  },

  // Get current user info from token
  getCurrentUser: () => {
    const token = Cookies.get('access_token');
    if (!token) return null;

    try {
      // Decode JWT token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Login user and save tokens
  login: (accessToken, refreshToken, rememberMe = false) => {
    const accessExpires = rememberMe ? 30 : 1; // 30 days if remember me, else 1 day
    const refreshExpires = rememberMe ? 60 : 7; // 60 days if remember me, else 7 days
    
    Cookies.set('access_token', accessToken, { expires: accessExpires });
    Cookies.set('refresh_token', refreshToken, { expires: refreshExpires });
  },

  // Logout user and remove tokens
  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  },

  // Get access token
  getAccessToken: () => {
    return Cookies.get('access_token');
  },

  // Get refresh token
  getRefreshToken: () => {
    return Cookies.get('refresh_token');
  },
};