'use strict';

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _buildPage = require('./build-page');

var _buildPage2 = _interopRequireDefault(_buildPage);

var _pageFileTypes = require('./page-file-types');

var _pageFileTypes2 = _interopRequireDefault(_pageFileTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*  weak */
var debug = require('debug')('gatsby:glob');

function globQuery(directory) {
  var fileGlobQuery = _pageFileTypes2.default.map(function (type) {
    return '*.' + type;
  });
  var joinedFileQuery = fileGlobQuery.join('|');
  return directory + '/pages/**/?(' + joinedFileQuery + ')';
}

var globCache = void 0;
function createCache(directory, callback) {
  var pagesData = [];

  (0, _glob2.default)(globQuery(directory), { follow: true }, function (err, pages) {
    if (err) {
      return callback(err);
    }

    pages.forEach(function (page) {
      pagesData.push((0, _buildPage2.default)(directory, page));
    });

    debug('globbed ' + pagesData.length + ' pages');
    globCache = pagesData;
    return callback(null, pagesData);
  });
}

module.exports = function globPages(directory, callback) {
  if (typeof globCache === 'undefined') {
    createCache(directory, callback);
  } else {
    callback(null, globCache);
  }
};