"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.clone = clone;
exports.mergeObjects = mergeObjects;
exports.basename = basename;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function clone(something) {
    return doClone(something);
}
function doClone(something) {
    if (Array.isArray(something)) return cloneArray(something);
    if ((typeof something === 'undefined' ? 'undefined' : _typeof(something)) === 'object') return cloneObj(something);
    return something;
}
function cloneArray(arr) {
    var r = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        r[i] = doClone(arr[i]);
    }
    return r;
}
function cloneObj(obj) {
    var r = {};
    for (var key in obj) {
        r[key] = doClone(obj[key]);
    }
    return r;
}
function mergeObjects(target) {
    for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
    }

    sources.forEach(function (source) {
        for (var key in source) {
            target[key] = source[key];
        }
    });
    return target;
}
function basename(path) {
    var idx = ~path.lastIndexOf('/') || ~path.lastIndexOf('\\');
    if (idx === 0) {
        return path;
    } else if (~idx === path.length - 1) {
        return basename(path.substring(0, path.length - 1));
    } else {
        return path.substr(~idx + 1);
    }
}
var CAPTURING_REGEX_SOURCE = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/;

var RegexSource = exports.RegexSource = function () {
    function RegexSource() {
        _classCallCheck(this, RegexSource);
    }

    _createClass(RegexSource, null, [{
        key: 'hasCaptures',
        value: function hasCaptures(regexSource) {
            return CAPTURING_REGEX_SOURCE.test(regexSource);
        }
    }, {
        key: 'replaceCaptures',
        value: function replaceCaptures(regexSource, captureSource, captureIndices) {
            return regexSource.replace(CAPTURING_REGEX_SOURCE, function (match, index, commandIndex, command) {
                var capture = captureIndices[parseInt(index || commandIndex, 10)];
                if (capture) {
                    var result = captureSource.substring(capture.start, capture.end);
                    while (result[0] === '.') {
                        result = result.substring(1);
                    }
                    switch (command) {
                        case 'downcase':
                            return result.toLowerCase();
                        case 'upcase':
                            return result.toUpperCase();
                        default:
                            return result;
                    }
                } else {
                    return match;
                }
            });
        }
    }]);

    return RegexSource;
}();