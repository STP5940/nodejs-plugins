module.exports = {
  apps: [{
    name: 'CMMS-WebApp', // Name of your application
    script: './bin/www', // Path to your main script file
    interpreter: "node", // Path to the Bun interpreter

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    instances: '3', // You can specify the number of instances based on your server's capacity
    exec_mode: 'cluster', // You can use 'cluster' mode to utilize multiple CPU cores
    autorestart: true, // Automatically restart the application if it crashes
    watch: false, // Watch for file changes and restart the application (set to false for production)
    max_memory_restart: '1G', // Restart the application if it exceeds a certain memory limit
    log_date_format: 'YYYY-MM-DD HH:mm:ss', // Date format for log entries

    // Define log files for standard output and error output
    output: './logs/api.log',
    error: './logs/_error.log',

    env: {
      NODE_ENV: "development",
      PORT: 3000,
      MORGAN_FORMAT: ':remote-addr :status ":method :url" :res[content-length] :response-time ms ":user-agent"'
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 9001,
      MORGAN_FORMAT: ':remote-addr :status ":method :url" :res[content-length] :response-time ms ":user-agent"'
    }
  }]
};
