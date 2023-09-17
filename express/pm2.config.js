module.exports = {
    apps: [
      {
        name: 'ws',
        port: '3001',
        instances: 1,
        exec_mode: 'cluster',
        script: './server.js'
      }
    ]
  }
  