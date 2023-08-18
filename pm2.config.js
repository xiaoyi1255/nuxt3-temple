module.exports = {
    apps: [
      {
        name: 'xiaoyiApp',
        port: '80',
        exec_mode: 'cluster',
        script: './.output/server/index.mjs'
      },
      {
        name: 'ws',
        port: '3000',
        exec_mode: 'cluster',
        script: './server.js'
      }
    ]
  }
  