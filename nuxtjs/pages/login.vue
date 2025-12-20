<template>
  <div class="login-container">
    <div class="login-form">
      <h1>登录</h1>
      <el-form :model="form" label-width="0">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名/手机号/邮箱"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="links">
        <nuxt-link to="/register">注册账号</nuxt-link>
        <nuxt-link to="/forget">忘记密码</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const form = ref({
  username: '',
  password: '',
});

const handleLogin = async () => {
  try {
    await userStore.login(form.value.username, form.value.password);
    navigateTo('/');
  } catch (error) {
    ElMessage.error('登录失败');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>

