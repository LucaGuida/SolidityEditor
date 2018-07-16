'use strict';

/*  weak */
var logger = require('tracer').colorConsole();

var initStarter = require('./init-starter');

module.exports = function (rootPath) {
  var starter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'gh:gatsbyjs/gatsby-starter-default';

  initStarter(starter, {
    rootPath: rootPath,
    logger: logger
  }, function (error) {
    if (error) {
      logger.error(error);
    }
  });
};