"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RuleFactory = exports.BeginWhileRule = exports.BeginEndRule = exports.IncludeOnlyRule = exports.MatchRule = exports.RegExpSourceList = exports.RegExpSource = exports.CaptureRule = exports.Rule = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HAS_BACK_REFERENCES = /\\(\d+)/;
var BACK_REFERENCING_END = /\\(\d+)/g;

var Rule = exports.Rule = function () {
    function Rule($location, id, name, contentName) {
        _classCallCheck(this, Rule);

        this.$location = $location;
        this.id = id;
        this._name = name || null;
        this._nameIsCapturing = _utils.RegexSource.hasCaptures(this._name);
        this._contentName = contentName || null;
        this._contentNameIsCapturing = _utils.RegexSource.hasCaptures(this._contentName);
    }

    _createClass(Rule, [{
        key: 'getName',
        value: function getName(lineText, captureIndices) {
            if (!this._nameIsCapturing) {
                return this._name;
            }
            return _utils.RegexSource.replaceCaptures(this._name, lineText, captureIndices);
        }
    }, {
        key: 'getContentName',
        value: function getContentName(lineText, captureIndices) {
            if (!this._contentNameIsCapturing) {
                return this._contentName;
            }
            return _utils.RegexSource.replaceCaptures(this._contentName, lineText, captureIndices);
        }
    }, {
        key: 'collectPatternsRecursive',
        value: function collectPatternsRecursive(grammar, out, isFirst) {
            throw new Error('Implement me!');
        }
    }, {
        key: 'compile',
        value: function compile(grammar, endRegexSource, allowA, allowG) {
            throw new Error('Implement me!');
        }
    }, {
        key: 'debugName',
        get: function get() {
            return this.constructor.name + '#' + this.id + ' @ ' + (0, _utils.basename)(this.$location.filename) + ':' + this.$location.line;
        }
    }]);

    return Rule;
}();

var CaptureRule = exports.CaptureRule = function (_Rule) {
    _inherits(CaptureRule, _Rule);

    function CaptureRule($location, id, name, contentName, retokenizeCapturedWithRuleId) {
        _classCallCheck(this, CaptureRule);

        var _this = _possibleConstructorReturn(this, (CaptureRule.__proto__ || Object.getPrototypeOf(CaptureRule)).call(this, $location, id, name, contentName));

        _this.retokenizeCapturedWithRuleId = retokenizeCapturedWithRuleId;
        return _this;
    }

    return CaptureRule;
}(Rule);

var RegExpSource = exports.RegExpSource = function () {
    function RegExpSource(regExpSource, ruleId) {
        var handleAnchors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        _classCallCheck(this, RegExpSource);

        if (handleAnchors) {
            this._handleAnchors(regExpSource);
        } else {
            this.source = regExpSource;
            this.hasAnchor = false;
        }
        if (this.hasAnchor) {
            this._anchorCache = this._buildAnchorCache();
        }
        this.ruleId = ruleId;
        this.hasBackReferences = HAS_BACK_REFERENCES.test(this.source);
    }

    _createClass(RegExpSource, [{
        key: 'clone',
        value: function clone() {
            return new RegExpSource(this.source, this.ruleId, true);
        }
    }, {
        key: 'setSource',
        value: function setSource(newSource) {
            if (this.source === newSource) {
                return;
            }
            this.source = newSource;
            if (this.hasAnchor) {
                this._anchorCache = this._buildAnchorCache();
            }
        }
    }, {
        key: '_handleAnchors',
        value: function _handleAnchors(regExpSource) {
            if (regExpSource) {
                var pos = void 0,
                    len = void 0,
                    ch = void 0,
                    nextCh = void 0,
                    lastPushedPos = 0,
                    output = [];
                var hasAnchor = false;
                for (pos = 0, len = regExpSource.length; pos < len; pos++) {
                    ch = regExpSource.charAt(pos);
                    if (ch === '\\') {
                        if (pos + 1 < len) {
                            nextCh = regExpSource.charAt(pos + 1);
                            if (nextCh === 'z') {
                                output.push(regExpSource.substring(lastPushedPos, pos));
                                output.push('$(?!\\n)(?<!\\n)');
                                lastPushedPos = pos + 2;
                            } else if (nextCh === 'A' || nextCh === 'G') {
                                hasAnchor = true;
                            }
                            pos++;
                        }
                    }
                }
                this.hasAnchor = hasAnchor;
                if (lastPushedPos === 0) {
                    this.source = regExpSource;
                } else {
                    output.push(regExpSource.substring(lastPushedPos, len));
                    this.source = output.join('');
                }
            } else {
                this.hasAnchor = false;
                this.source = regExpSource;
            }
        }
    }, {
        key: 'resolveBackReferences',
        value: function resolveBackReferences(lineText, captureIndices) {
            var capturedValues = captureIndices.map(function (capture) {
                return lineText.substring(capture.start, capture.end);
            });
            BACK_REFERENCING_END.lastIndex = 0;
            return this.source.replace(BACK_REFERENCING_END, function (match, g1) {
                return escapeRegExpCharacters(capturedValues[parseInt(g1, 10)] || '');
            });
        }
    }, {
        key: '_buildAnchorCache',
        value: function _buildAnchorCache() {
            var A0_G0_result = [];
            var A0_G1_result = [];
            var A1_G0_result = [];
            var A1_G1_result = [];
            var pos = void 0,
                len = void 0,
                ch = void 0,
                nextCh = void 0;
            for (pos = 0, len = this.source.length; pos < len; pos++) {
                ch = this.source.charAt(pos);
                A0_G0_result[pos] = ch;
                A0_G1_result[pos] = ch;
                A1_G0_result[pos] = ch;
                A1_G1_result[pos] = ch;
                if (ch === '\\') {
                    if (pos + 1 < len) {
                        nextCh = this.source.charAt(pos + 1);
                        if (nextCh === 'A') {
                            A0_G0_result[pos + 1] = '\uFFFF';
                            A0_G1_result[pos + 1] = '\uFFFF';
                            A1_G0_result[pos + 1] = 'A';
                            A1_G1_result[pos + 1] = 'A';
                        } else if (nextCh === 'G') {
                            A0_G0_result[pos + 1] = '\uFFFF';
                            A0_G1_result[pos + 1] = 'G';
                            A1_G0_result[pos + 1] = '\uFFFF';
                            A1_G1_result[pos + 1] = 'G';
                        } else {
                            A0_G0_result[pos + 1] = nextCh;
                            A0_G1_result[pos + 1] = nextCh;
                            A1_G0_result[pos + 1] = nextCh;
                            A1_G1_result[pos + 1] = nextCh;
                        }
                        pos++;
                    }
                }
            }
            return {
                A0_G0: A0_G0_result.join(''),
                A0_G1: A0_G1_result.join(''),
                A1_G0: A1_G0_result.join(''),
                A1_G1: A1_G1_result.join('')
            };
        }
    }, {
        key: 'resolveAnchors',
        value: function resolveAnchors(allowA, allowG) {
            if (!this.hasAnchor) {
                return this.source;
            }
            if (allowA) {
                if (allowG) {
                    return this._anchorCache.A1_G1;
                } else {
                    return this._anchorCache.A1_G0;
                }
            } else {
                if (allowG) {
                    return this._anchorCache.A0_G1;
                } else {
                    return this._anchorCache.A0_G0;
                }
            }
        }
    }]);

    return RegExpSource;
}();

var RegExpSourceList = exports.RegExpSourceList = function () {
    function RegExpSourceList() {
        _classCallCheck(this, RegExpSourceList);

        this._items = [];
        this._hasAnchors = false;
        this._cached = null;
        this._cachedSources = null;
        this._anchorCache = {
            A0_G0: null,
            A0_G1: null,
            A1_G0: null,
            A1_G1: null
        };
    }

    _createClass(RegExpSourceList, [{
        key: 'push',
        value: function push(item) {
            this._items.push(item);
            this._hasAnchors = this._hasAnchors || item.hasAnchor;
        }
    }, {
        key: 'unshift',
        value: function unshift(item) {
            this._items.unshift(item);
            this._hasAnchors = this._hasAnchors || item.hasAnchor;
        }
    }, {
        key: 'length',
        value: function length() {
            return this._items.length;
        }
    }, {
        key: 'setSource',
        value: function setSource(index, newSource) {
            if (this._items[index].source !== newSource) {
                // bust the cache
                this._cached = null;
                this._anchorCache.A0_G0 = null;
                this._anchorCache.A0_G1 = null;
                this._anchorCache.A1_G0 = null;
                this._anchorCache.A1_G1 = null;
                this._items[index].setSource(newSource);
            }
        }
    }, {
        key: 'compile',
        value: function compile(onigLib, allowA, allowG) {
            if (!this._hasAnchors) {
                if (!this._cached) {
                    var regExps = this._items.map(function (e) {
                        return e.source;
                    });
                    this._cached = {
                        scanner: onigLib.createOnigScanner(regExps),
                        rules: this._items.map(function (e) {
                            return e.ruleId;
                        }),
                        debugRegExps: regExps
                    };
                }
                return this._cached;
            } else {
                this._anchorCache = {
                    A0_G0: this._anchorCache.A0_G0 || (allowA === false && allowG === false ? this._resolveAnchors(onigLib, allowA, allowG) : null),
                    A0_G1: this._anchorCache.A0_G1 || (allowA === false && allowG === true ? this._resolveAnchors(onigLib, allowA, allowG) : null),
                    A1_G0: this._anchorCache.A1_G0 || (allowA === true && allowG === false ? this._resolveAnchors(onigLib, allowA, allowG) : null),
                    A1_G1: this._anchorCache.A1_G1 || (allowA === true && allowG === true ? this._resolveAnchors(onigLib, allowA, allowG) : null)
                };
                if (allowA) {
                    if (allowG) {
                        return this._anchorCache.A1_G1;
                    } else {
                        return this._anchorCache.A1_G0;
                    }
                } else {
                    if (allowG) {
                        return this._anchorCache.A0_G1;
                    } else {
                        return this._anchorCache.A0_G0;
                    }
                }
            }
        }
    }, {
        key: '_resolveAnchors',
        value: function _resolveAnchors(onigLib, allowA, allowG) {
            var regExps = this._items.map(function (e) {
                return e.resolveAnchors(allowA, allowG);
            });
            return {
                scanner: onigLib.createOnigScanner(regExps),
                rules: this._items.map(function (e) {
                    return e.ruleId;
                }),
                debugRegExps: regExps
            };
        }
    }]);

    return RegExpSourceList;
}();

var MatchRule = exports.MatchRule = function (_Rule2) {
    _inherits(MatchRule, _Rule2);

    function MatchRule($location, id, name, match, captures) {
        _classCallCheck(this, MatchRule);

        var _this2 = _possibleConstructorReturn(this, (MatchRule.__proto__ || Object.getPrototypeOf(MatchRule)).call(this, $location, id, name, null));

        _this2._match = new RegExpSource(match, _this2.id);
        _this2.captures = captures;
        _this2._cachedCompiledPatterns = null;
        return _this2;
    }

    _createClass(MatchRule, [{
        key: 'collectPatternsRecursive',
        value: function collectPatternsRecursive(grammar, out, isFirst) {
            out.push(this._match);
        }
    }, {
        key: 'compile',
        value: function compile(grammar, endRegexSource, allowA, allowG) {
            if (!this._cachedCompiledPatterns) {
                this._cachedCompiledPatterns = new RegExpSourceList();
                this.collectPatternsRecursive(grammar, this._cachedCompiledPatterns, true);
            }
            return this._cachedCompiledPatterns.compile(grammar, allowA, allowG);
        }
    }, {
        key: 'debugMatchRegExp',
        get: function get() {
            return '' + this._match.source;
        }
    }]);

    return MatchRule;
}(Rule);

var IncludeOnlyRule = exports.IncludeOnlyRule = function (_Rule3) {
    _inherits(IncludeOnlyRule, _Rule3);

    function IncludeOnlyRule($location, id, name, contentName, patterns) {
        _classCallCheck(this, IncludeOnlyRule);

        var _this3 = _possibleConstructorReturn(this, (IncludeOnlyRule.__proto__ || Object.getPrototypeOf(IncludeOnlyRule)).call(this, $location, id, name, contentName));

        _this3.patterns = patterns.patterns;
        _this3.hasMissingPatterns = patterns.hasMissingPatterns;
        _this3._cachedCompiledPatterns = null;
        return _this3;
    }

    _createClass(IncludeOnlyRule, [{
        key: 'collectPatternsRecursive',
        value: function collectPatternsRecursive(grammar, out, isFirst) {
            var i = void 0,
                len = void 0,
                rule = void 0;
            for (i = 0, len = this.patterns.length; i < len; i++) {
                rule = grammar.getRule(this.patterns[i]);
                rule.collectPatternsRecursive(grammar, out, false);
            }
        }
    }, {
        key: 'compile',
        value: function compile(grammar, endRegexSource, allowA, allowG) {
            if (!this._cachedCompiledPatterns) {
                this._cachedCompiledPatterns = new RegExpSourceList();
                this.collectPatternsRecursive(grammar, this._cachedCompiledPatterns, true);
            }
            return this._cachedCompiledPatterns.compile(grammar, allowA, allowG);
        }
    }]);

    return IncludeOnlyRule;
}(Rule);

function escapeRegExpCharacters(value) {
    return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
}

var BeginEndRule = exports.BeginEndRule = function (_Rule4) {
    _inherits(BeginEndRule, _Rule4);

    function BeginEndRule($location, id, name, contentName, begin, beginCaptures, end, endCaptures, applyEndPatternLast, patterns) {
        _classCallCheck(this, BeginEndRule);

        var _this4 = _possibleConstructorReturn(this, (BeginEndRule.__proto__ || Object.getPrototypeOf(BeginEndRule)).call(this, $location, id, name, contentName));

        _this4._begin = new RegExpSource(begin, _this4.id);
        _this4.beginCaptures = beginCaptures;
        _this4._end = new RegExpSource(end, -1);
        _this4.endHasBackReferences = _this4._end.hasBackReferences;
        _this4.endCaptures = endCaptures;
        _this4.applyEndPatternLast = applyEndPatternLast || false;
        _this4.patterns = patterns.patterns;
        _this4.hasMissingPatterns = patterns.hasMissingPatterns;
        _this4._cachedCompiledPatterns = null;
        return _this4;
    }

    _createClass(BeginEndRule, [{
        key: 'getEndWithResolvedBackReferences',
        value: function getEndWithResolvedBackReferences(lineText, captureIndices) {
            return this._end.resolveBackReferences(lineText, captureIndices);
        }
    }, {
        key: 'collectPatternsRecursive',
        value: function collectPatternsRecursive(grammar, out, isFirst) {
            if (isFirst) {
                var i = void 0,
                    len = void 0,
                    rule = void 0;
                for (i = 0, len = this.patterns.length; i < len; i++) {
                    rule = grammar.getRule(this.patterns[i]);
                    rule.collectPatternsRecursive(grammar, out, false);
                }
            } else {
                out.push(this._begin);
            }
        }
    }, {
        key: 'compile',
        value: function compile(grammar, endRegexSource, allowA, allowG) {
            var precompiled = this._precompile(grammar);
            if (this._end.hasBackReferences) {
                if (this.applyEndPatternLast) {
                    precompiled.setSource(precompiled.length() - 1, endRegexSource);
                } else {
                    precompiled.setSource(0, endRegexSource);
                }
            }
            return this._cachedCompiledPatterns.compile(grammar, allowA, allowG);
        }
    }, {
        key: '_precompile',
        value: function _precompile(grammar) {
            if (!this._cachedCompiledPatterns) {
                this._cachedCompiledPatterns = new RegExpSourceList();
                this.collectPatternsRecursive(grammar, this._cachedCompiledPatterns, true);
                if (this.applyEndPatternLast) {
                    this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end);
                } else {
                    this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
                }
            }
            return this._cachedCompiledPatterns;
        }
    }, {
        key: 'debugBeginRegExp',
        get: function get() {
            return '' + this._begin.source;
        }
    }, {
        key: 'debugEndRegExp',
        get: function get() {
            return '' + this._end.source;
        }
    }]);

    return BeginEndRule;
}(Rule);

var BeginWhileRule = exports.BeginWhileRule = function (_Rule5) {
    _inherits(BeginWhileRule, _Rule5);

    function BeginWhileRule($location, id, name, contentName, begin, beginCaptures, _while, whileCaptures, patterns) {
        _classCallCheck(this, BeginWhileRule);

        var _this5 = _possibleConstructorReturn(this, (BeginWhileRule.__proto__ || Object.getPrototypeOf(BeginWhileRule)).call(this, $location, id, name, contentName));

        _this5._begin = new RegExpSource(begin, _this5.id);
        _this5.beginCaptures = beginCaptures;
        _this5.whileCaptures = whileCaptures;
        _this5._while = new RegExpSource(_while, -2);
        _this5.whileHasBackReferences = _this5._while.hasBackReferences;
        _this5.patterns = patterns.patterns;
        _this5.hasMissingPatterns = patterns.hasMissingPatterns;
        _this5._cachedCompiledPatterns = null;
        _this5._cachedCompiledWhilePatterns = null;
        return _this5;
    }

    _createClass(BeginWhileRule, [{
        key: 'getWhileWithResolvedBackReferences',
        value: function getWhileWithResolvedBackReferences(lineText, captureIndices) {
            return this._while.resolveBackReferences(lineText, captureIndices);
        }
    }, {
        key: 'collectPatternsRecursive',
        value: function collectPatternsRecursive(grammar, out, isFirst) {
            if (isFirst) {
                var i = void 0,
                    len = void 0,
                    rule = void 0;
                for (i = 0, len = this.patterns.length; i < len; i++) {
                    rule = grammar.getRule(this.patterns[i]);
                    rule.collectPatternsRecursive(grammar, out, false);
                }
            } else {
                out.push(this._begin);
            }
        }
    }, {
        key: 'compile',
        value: function compile(grammar, endRegexSource, allowA, allowG) {
            this._precompile(grammar);
            return this._cachedCompiledPatterns.compile(grammar, allowA, allowG);
        }
    }, {
        key: '_precompile',
        value: function _precompile(grammar) {
            if (!this._cachedCompiledPatterns) {
                this._cachedCompiledPatterns = new RegExpSourceList();
                this.collectPatternsRecursive(grammar, this._cachedCompiledPatterns, true);
            }
        }
    }, {
        key: 'compileWhile',
        value: function compileWhile(grammar, endRegexSource, allowA, allowG) {
            this._precompileWhile(grammar);
            if (this._while.hasBackReferences) {
                this._cachedCompiledWhilePatterns.setSource(0, endRegexSource);
            }
            return this._cachedCompiledWhilePatterns.compile(grammar, allowA, allowG);
        }
    }, {
        key: '_precompileWhile',
        value: function _precompileWhile(grammar) {
            if (!this._cachedCompiledWhilePatterns) {
                this._cachedCompiledWhilePatterns = new RegExpSourceList();
                this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while);
            }
        }
    }]);

    return BeginWhileRule;
}(Rule);

var RuleFactory = exports.RuleFactory = function () {
    function RuleFactory() {
        _classCallCheck(this, RuleFactory);
    }

    _createClass(RuleFactory, null, [{
        key: 'createCaptureRule',
        value: function createCaptureRule(helper, $location, name, contentName, retokenizeCapturedWithRuleId) {
            return helper.registerRule(function (id) {
                return new CaptureRule($location, id, name, contentName, retokenizeCapturedWithRuleId);
            });
        }
    }, {
        key: 'getCompiledRuleId',
        value: function getCompiledRuleId(desc, helper, repository) {
            if (!desc.id) {
                helper.registerRule(function (id) {
                    desc.id = id;
                    if (desc.match) {
                        return new MatchRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.match, RuleFactory._compileCaptures(desc.captures, helper, repository));
                    }
                    if (typeof desc.begin === 'undefined') {
                        if (desc.repository) {
                            repository = (0, _utils.mergeObjects)({}, repository, desc.repository);
                        }
                        return new IncludeOnlyRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, RuleFactory._compilePatterns(desc.patterns, helper, repository));
                    }
                    if (desc.while) {
                        return new BeginWhileRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, RuleFactory._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.while, RuleFactory._compileCaptures(desc.whileCaptures || desc.captures, helper, repository), RuleFactory._compilePatterns(desc.patterns, helper, repository));
                    }
                    return new BeginEndRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, RuleFactory._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.end, RuleFactory._compileCaptures(desc.endCaptures || desc.captures, helper, repository), desc.applyEndPatternLast, RuleFactory._compilePatterns(desc.patterns, helper, repository));
                });
            }
            return desc.id;
        }
    }, {
        key: '_compileCaptures',
        value: function _compileCaptures(captures, helper, repository) {
            var r = [],
                numericCaptureId = void 0,
                maximumCaptureId = void 0,
                i = void 0,
                captureId = void 0;
            if (captures) {
                maximumCaptureId = 0;
                for (captureId in captures) {
                    if (captureId === '$vscodeTextmateLocation') {
                        continue;
                    }
                    numericCaptureId = parseInt(captureId, 10);
                    if (numericCaptureId > maximumCaptureId) {
                        maximumCaptureId = numericCaptureId;
                    }
                }
                for (i = 0; i <= maximumCaptureId; i++) {
                    r[i] = null;
                }
                for (captureId in captures) {
                    if (captureId === '$vscodeTextmateLocation') {
                        continue;
                    }
                    numericCaptureId = parseInt(captureId, 10);
                    var retokenizeCapturedWithRuleId = 0;
                    if (captures[captureId].patterns) {
                        retokenizeCapturedWithRuleId = RuleFactory.getCompiledRuleId(captures[captureId], helper, repository);
                    }
                    r[numericCaptureId] = RuleFactory.createCaptureRule(helper, captures[captureId].$vscodeTextmateLocation, captures[captureId].name, captures[captureId].contentName, retokenizeCapturedWithRuleId);
                }
            }
            return r;
        }
    }, {
        key: '_compilePatterns',
        value: function _compilePatterns(patterns, helper, repository) {
            var r = [],
                pattern = void 0,
                i = void 0,
                len = void 0,
                patternId = void 0,
                externalGrammar = void 0,
                rule = void 0,
                skipRule = void 0;
            if (patterns) {
                for (i = 0, len = patterns.length; i < len; i++) {
                    pattern = patterns[i];
                    patternId = -1;
                    if (pattern.include) {
                        if (pattern.include.charAt(0) === '#') {
                            var localIncludedRule = repository[pattern.include.substr(1)];
                            if (localIncludedRule) {
                                patternId = RuleFactory.getCompiledRuleId(localIncludedRule, helper, repository);
                            } else {}
                        } else if (pattern.include === '$base' || pattern.include === '$self') {
                            patternId = RuleFactory.getCompiledRuleId(repository[pattern.include], helper, repository);
                        } else {
                            var externalGrammarName = null,
                                externalGrammarInclude = null,
                                sharpIndex = pattern.include.indexOf('#');
                            if (sharpIndex >= 0) {
                                externalGrammarName = pattern.include.substring(0, sharpIndex);
                                externalGrammarInclude = pattern.include.substring(sharpIndex + 1);
                            } else {
                                externalGrammarName = pattern.include;
                            }
                            externalGrammar = helper.getExternalGrammar(externalGrammarName, repository);
                            if (externalGrammar) {
                                if (externalGrammarInclude) {
                                    var externalIncludedRule = externalGrammar.repository[externalGrammarInclude];
                                    if (externalIncludedRule) {
                                        patternId = RuleFactory.getCompiledRuleId(externalIncludedRule, helper, externalGrammar.repository);
                                    } else {}
                                } else {
                                    patternId = RuleFactory.getCompiledRuleId(externalGrammar.repository.$self, helper, externalGrammar.repository);
                                }
                            } else {}
                        }
                    } else {
                        patternId = RuleFactory.getCompiledRuleId(pattern, helper, repository);
                    }
                    if (patternId !== -1) {
                        rule = helper.getRule(patternId);
                        skipRule = false;
                        if (rule instanceof IncludeOnlyRule || rule instanceof BeginEndRule || rule instanceof BeginWhileRule) {
                            if (rule.hasMissingPatterns && rule.patterns.length === 0) {
                                skipRule = true;
                            }
                        }
                        if (skipRule) {
                            continue;
                        }
                        r.push(patternId);
                    }
                }
            }
            return {
                patterns: r,
                hasMissingPatterns: (patterns ? patterns.length : 0) !== r.length
            };
        }
    }]);

    return RuleFactory;
}();