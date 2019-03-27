/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {
      logger:{
          dir: './ql-log',
          level: 'INFO',
          consoleLevel: 'INFO',
          allowDebugAtProd: true,
          disableConsoleAfterReady: true,
          outputJSON: false
      },
      io:{
          init: { }, // passed to engine.io
          namespace: {
              '/': {
                  connectionMiddleware: ["wx"],
                  packetMiddleware: [],
              },
          }

      },
  };


  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1552543162121_8901';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',

  };

  return {
    ...config,
    ...userConfig,
  };
};

