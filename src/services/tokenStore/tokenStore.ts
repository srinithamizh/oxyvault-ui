const ACCESS_TOKEN_KEY = "oxyvault-access-token";

// Session storage survives reloads in this tab, but is cleared when the tab closes.
let accessToken: string | null = null;

export const getAccessToken = () => {
  const token = accessToken ?? window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return token?.trim() ? token : null;
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const clearAccessToken = () => {
  accessToken = null;
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};
