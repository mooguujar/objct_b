import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null as any,
  }),

  getters: {
    isLogin: (state) => !!state.token,
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      const tokenCookie = useCookie('token');
      tokenCookie.value = token;
    },

    setUserInfo(userInfo: any) {
      this.userInfo = userInfo;
    },

    async login(username: string, password: string) {
      const api = useApi();
      const res = await api('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      this.setToken(res.access_token);
      this.setUserInfo(res.user);
      return res;
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      const tokenCookie = useCookie('token');
      tokenCookie.value = null;
      navigateTo('/login');
    },
  },
});

