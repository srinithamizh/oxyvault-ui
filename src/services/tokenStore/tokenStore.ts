/**
 * Holds the bearer token in a module variable, i.e. in memory only. It is never written to
 * localStorage, sessionStorage or cookies, so it can't be read back by other scripts at rest and it
 * disappears on reload or when the tab closes.
 */
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const clearAccessToken = () => {
  accessToken = null;
};
