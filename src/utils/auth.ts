export const isAuthenticated = (): boolean =>
  Boolean(localStorage.getItem("access_token"));

