'use strict';

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _config = require('config');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*  weak */
function isDataURL(s) {
  // Regex from https://gist.github.com/bgrins/6194623#gistcomment-1671744
  // eslint-disable-next-line max-len
  var regex = /^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9!\$&',\(\)\*\+,;=\-\._~:@\/\?%\s]*\s*$/i;
  return !!s.match(regex);
}

// Function to add prefix to links.
var prefixLink = function prefixLink(_link) {
  if (typeof __PREFIX_LINKS__ !== 'undefined' && __PREFIX_LINKS__ !== null && __PREFIX_LINKS__ && _config.config.linkPrefix !== null) {
    var invariantMessage = '\n    You\'re trying to build your site with links prefixed\n    but you haven\'t set \'linkPrefix\' in your config.toml.\n    ';
    (0, _invariant2.default)((0, _isString3.default)(_config.config.linkPrefix), invariantMessage);

    // When url-loader is used with the limit option, some of images are encoded to
    // base64 data url, this check prevent such links from being prefixed.
    if (isDataURL(_link)) {
      return _link;
    } else {
      if (_link.slice(0, 1) !== '/') {
        return _config.config.linkPrefix + '/' + _link;
      }
      return '' + _config.config.linkPrefix + _link;
    }
  } else {
    return _link;
  }
};

module.exports = {
  prefixLink: prefixLink
};