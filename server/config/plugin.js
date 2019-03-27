'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
    mysql:{
        enable: true,
        package: 'egg-mysql',
    },
    io : {
        enable: true,
        package: 'egg-socket.io',
    },
    redis : {
        enable: true,
        package: 'egg-redis',
    }
};


