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
  login: (accessToken, refreshToken) => {
    Cookies.set('access_token', accessToken, { expires: 1 }); // 1 day
    Cookies.set('refresh_token', refreshToken, { expires: 7 }); // 7 days
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