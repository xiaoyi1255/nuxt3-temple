module.exports = {
    apps: [
      {
        name: 'xiaoyiApp',
        port: '80',
        exec_mode: 'cluster',
        instances: 1,
        script: './.output/server/index.mjs'
      },
      {
        name: 'ws',
        port: '3000',
        instances: 1,
        exec_mode: 'cluster',
        script: '../express/server.js'
      }
    ]
  }
  