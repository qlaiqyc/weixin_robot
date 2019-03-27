'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {

  const { router, controller, io } = app;
    router.get('/', controller.home.index);
  router.get('/api/v1/getAllRooms', controller.api.getAllRooms);
  io.of('/').route('message', io.controller.wx.message);
};

