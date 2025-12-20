import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const baseURL = process.env.UNI_APP_API_BASE_URL || 'http://localhost:3000/api/v1';

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = uni.getStorageSync('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
      config.headers['X-Platform'] = 'app';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    if (res.code === 200) {
      return res.data;
    }
    if (res.code === 401) {
      uni.removeStorageSync('token');
      uni.reLaunch({
        url: '/pages/login/login',
      });
    }
    uni.showToast({
      title: res.message || '请求失败',
      icon: 'none',
    });
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    uni.showToast({
      title: error.message || '网络错误',
      icon: 'none',
    });
    return Promise.reject(error);
  },
);

export default request;

