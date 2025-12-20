export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const api = $fetch.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    onRequest({ request, options }) {
      const token = useCookie('token');
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        };
      }
      options.headers = {
        ...options.headers,
        'X-Platform': 'web',
      };
    },
    onResponse({ response }) {
      if (response._data?.code === 200) {
        return response._data.data;
      }
      if (response._data?.code === 401) {
        const token = useCookie('token');
        token.value = null;
        navigateTo('/login');
      }
      throw new Error(response._data?.message || '请求失败');
    },
  });

  return api;
};

