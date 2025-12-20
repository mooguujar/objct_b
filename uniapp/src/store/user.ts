import { defineStore } from 'pinia';
import request from '@/utils/request';

interface UserState {
  token: string;
  userInfo: any;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
  }),

  getters: {
    isLogin: (state) => !!state.token,
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      uni.setStorageSync('token', token);
    },

    setUserInfo(userInfo: any) {
      this.userInfo = userInfo;
      uni.setStorageSync('userInfo', userInfo);
    },

    async login(username: string, password: string) {
      const res = await request.post('/auth/login', { username, password });
      this.setToken(res.access_token);
      this.setUserInfo(res.user);
      return res;
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.reLaunch({
        url: '/pages/login/login',
      });
    },
  },
});

