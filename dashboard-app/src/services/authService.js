const TOKEN_KEY = 'jwt';

export const login = (username, password) => {
  // In a real app, you'd send a request to a server.
  // For this mock, we'll just check for a dummy user.
  if (username === 'admin' && password === 'password') {
    const token = 'this-is-a-dummy-jwt';
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return localStorage.getItem(TOKEN_KEY) !== null;
};
