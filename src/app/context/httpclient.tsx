import {httpBaseUrl} from '@app/constants';
import CookieManager from '@react-native-cookies/cookies';
import axios, {AxiosInstance} from 'axios';
import {createContext} from 'react';

const baseURL = httpBaseUrl;
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async config => {
    const cookies = await CookieManager.get(baseURL);
    if (cookies) {
      const cookieString = Object.entries(cookies)
        .map(([name, cookie]) => `${name}=${cookie.value}`)
        .join('; ');
      config.headers.Cookie = cookieString;
    }
    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  response => {
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      cookies.forEach(async cookie => {
        await CookieManager.setFromResponse(baseURL, cookie);
      });
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  },
);
export const AxiosContext = createContext<AxiosInstance>(axiosInstance);
