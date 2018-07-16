'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _endsWith2 = require('lodash/endsWith');

var _endsWith3 = _interopRequireDefault(_endsWith2);

var _startsWith2 = require('lodash/startsWith');

var _startsWith3 = _interopRequireDefault(_startsWith2);

var _isUndefined2 = require('lodash/isUndefined');

var _isUndefined3 = _interopRequireDefault(_isUndefined2);

var _includes2 = require('lodash/includes');

var _includes3 = _interopRequireDefault(_includes2);

exports.default = pathResolver;

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rewritePath = void 0; /*  weak */

try {
  var gatsbyNodeConfig = _path.posix.resolve(process.cwd(), './gatsby-node');
  // $FlowIssue - https://github.com/facebook/flow/issues/1975
  var nodeConfig = require(gatsbyNodeConfig);
  rewritePath = nodeConfig.rewritePath;
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND' && !(0, _includes3.default)(e.Error, 'gatsby-node')) {
    console.log(e);
  }
}

function pathResolver(pageData, parsedPath) {
  /**
   * Determines if a hardcoded path was given in the frontmatter of a page.
   * Then enforces a starting and trailing slash where applicable on the url.
   */
  function hardcodedPath() {
    if ((0, _isUndefined3.default)(pageData.path)) return void 0;

    var pagePath = pageData.path;

    // Enforce a starting slash on all paths
    var pathStartsWithSlash = (0, _startsWith3.default)(pagePath, '/');
    if (!pathStartsWithSlash) {
      pagePath = '/' + pagePath;
    }

    // Enforce a trailing slash on all paths
    var pathHasExtension = _path.posix.extname(pagePath) !== '';
    var pathEndsWithSlash = (0, _endsWith3.default)(pagePath, '/');
    if (!pathEndsWithSlash && !pathHasExtension) {
      pagePath = pagePath + '/';
    }

    return pagePath;
  }

  /**
   * Determines if the path should be rewritten using rules provided by the
   * user in the gatsby-node.js config file in the root of the project.
   */
  function rewrittenPath() {
    if (rewritePath) {
      return rewritePath(parsedPath, pageData);
    } else {
      return undefined;
    }
  }

  /**
   * Determines the path of the page using the default of its location on the
   * filesystem.
   */
  function defaultPath() {
    var dirname = parsedPath.dirname;
    var name = parsedPath.name;

    if (name === 'template' || name === 'index') {
      name = '';
    }
    return _path.posix.join('/', dirname, name, '/');
  }

  /**
   * Returns a path for a page. If the page name starts with an underscore,
   * undefined is returned as it does not become a page.
   */
  if (!(0, _startsWith3.default)(parsedPath.name, '_')) {
    return hardcodedPath() || rewrittenPath() || defaultPath();
  } else {
    return undefined;
  }
}