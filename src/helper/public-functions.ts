export const getLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  } else {
    return "";
  }
};
export const dataLocalStorage = {
  userinfo: "user",
  privileges: "privileges",
  loading_check_user: "loading_check_user",
};

export const saveLocalStorage = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};
