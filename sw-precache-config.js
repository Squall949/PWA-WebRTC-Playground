module.exports = {
    staticFileGlobs: [
      'build/index.html',
      'build/static/css/**.css',
      'build/static/js/**.js',
      'build/vendor/**.js'
    ],
    swFilePath: './build/service-worker.js',
    stripPrefix: 'build/',
    importScripts: ['./vendor/idb.js', './custom/sw.js', './vendor/fire.js','./custom/db.js', './vendor/polyfill.js'],
    handleFetch: false,
    runtimeCaching: [{
      urlPattern: /this\\.is\\.a\\.regex/,
      handler: 'networkFirst'
    }]
  }