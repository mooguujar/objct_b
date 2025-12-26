module.exports = {
  apps: [{
    name: 'nuxtjs-app',
    script: '.output/server/index.mjs',
    instances: 2, // 使用 2 个实例，或 'max' 使用所有 CPU 核心
    exec_mode: 'cluster', // 集群模式
    // Node.js 16 需要 --experimental-fetch 来支持 fetch API
    // 如果是 Node.js 18+ 可以移除这个参数
    node_args: '--experimental-fetch',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 日志配置
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // 自动重启
    autorestart: true,
    watch: false, // 生产环境关闭文件监听
    max_memory_restart: '1G', // 内存超过 1G 自动重启
    // 其他配置
    min_uptime: '10s', // 最小运行时间
    max_restarts: 10, // 最大重启次数
    restart_delay: 4000 // 重启延迟
  }]
}

