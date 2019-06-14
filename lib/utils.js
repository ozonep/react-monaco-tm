'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileLanguage = getFileLanguage;
exports.getTabTitle = getTabTitle;
var debounce = exports.debounce = function debounce(fn, time) {
  var timeout = void 0;
  return function () {
    var _this = this,
        _arguments = arguments;

    var functionCall = function functionCall() {
      return fn.apply(_this, _arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  };
};

// export const processSize = size => (/^\d+$/.test(size) ? `${size}px` : size);


function getFileLanguage() {
  var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

  if (path && path.includes('.')) {
    switch (path.split('.').pop()) {
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascriptReact';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'py':
        return 'python';
      default:
        return undefined;
    }
  }
  return undefined;
}

function getTabTitle() {
  var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

  if (path && path.includes('/')) {
    return path.split('/').pop();
  }
  return undefined;
}