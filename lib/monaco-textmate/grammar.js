"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LocalStackElement = exports.StackElement = exports.ScopeListElement = exports.StackElementMetadata = exports.Grammar = exports.ScopeMetadata = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createGrammar = createGrammar;
exports.collectIncludedScopes = collectIncludedScopes;

var _utils = require('./utils');

var _rule2 = require('./rule');

var _matcher = require('./matcher');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createGrammar(grammar, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository, onigLib) {
    return new Grammar(grammar, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository, onigLib);
}

function _extractIncludedScopesInPatterns(result, patterns) {
    for (var i = 0, len = patterns.length; i < len; i++) {
        if (Array.isArray(patterns[i].patterns)) {
            _extractIncludedScopesInPatterns(result, patterns[i].patterns);
        }
        var include = patterns[i].include;
        if (!include) continue;
        if (include === '$base' || include === '$self') continue;
        if (include.charAt(0) === '#') continue;
        var sharpIndex = include.indexOf('#');
        if (sharpIndex >= 0) {
            result[include.substring(0, sharpIndex)] = true;
        } else {
            result[include] = true;
        }
    }
}

function _extractIncludedScopesInRepository(result, repository) {
    for (var name in repository) {
        var rule = repository[name];
        if (rule.patterns && Array.isArray(rule.patterns)) {
            _extractIncludedScopesInPatterns(result, rule.patterns);
        }
        if (rule.repository) {
            _extractIncludedScopesInRepository(result, rule.repository);
        }
    }
}

function collectIncludedScopes(result, grammar) {
    if (grammar.patterns && Array.isArray(grammar.patterns)) {
        _extractIncludedScopesInPatterns(result, grammar.patterns);
    }
    if (grammar.repository) {
        _extractIncludedScopesInRepository(result, grammar.repository);
    }
    delete result[grammar.scopeName];
}

function scopesAreMatching(thisScopeName, scopeName) {
    if (!thisScopeName) return false;
    if (thisScopeName === scopeName) return true;
    var len = scopeName.length;
    return thisScopeName.length > len && thisScopeName.substr(0, len) === scopeName && thisScopeName[len] === '.';
}

function nameMatcher(identifers, scopes) {
    if (scopes.length < identifers.length) {
        return false;
    }
    var lastIndex = 0;
    return identifers.every(function (identifier) {
        for (var i = lastIndex; i < scopes.length; i++) {
            if (scopesAreMatching(scopes[i], identifier)) {
                lastIndex = i + 1;
                return true;
            }
        }
        return false;
    });
}

function collectInjections(result, selector, rule, ruleFactoryHelper, grammar) {
    var matchers = (0, _matcher.createMatchers)(selector, nameMatcher);
    var ruleId = _rule2.RuleFactory.getCompiledRuleId(rule, ruleFactoryHelper, grammar.repository);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = matchers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var matcher = _step.value;

            result.push({
                matcher: matcher.matcher,
                ruleId: ruleId,
                grammar: grammar,
                priority: matcher.priority
            });
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}

var ScopeMetadata = exports.ScopeMetadata = function ScopeMetadata(scopeName, languageId, tokenType, themeData) {
    _classCallCheck(this, ScopeMetadata);

    this.scopeName = scopeName;
    this.languageId = languageId;
    this.tokenType = tokenType;
    this.themeData = themeData;
};

var ScopeMetadataProvider = function () {
    function ScopeMetadataProvider(initialLanguage, themeProvider, embeddedLanguages) {
        _classCallCheck(this, ScopeMetadataProvider);

        this._initialLanguage = initialLanguage;
        this._themeProvider = themeProvider;
        this.onDidChangeTheme();
        this._embeddedLanguages = Object.create(null);
        if (embeddedLanguages) {
            var scopes = Object.keys(embeddedLanguages);
            for (var i = 0, len = scopes.length; i < len; i++) {
                var scope = scopes[i];
                var language = embeddedLanguages[scope];
                if (typeof language !== 'number' || language === 0) {
                    console.warn('Invalid embedded language found at scope ' + scope + ': <<' + language + '>>');
                    continue;
                }
                this._embeddedLanguages[scope] = language;
            }
        }
        var escapedScopes = Object.keys(this._embeddedLanguages).map(function (scopeName) {
            return ScopeMetadataProvider._escapeRegExpCharacters(scopeName);
        });
        if (escapedScopes.length === 0) {
            this._embeddedLanguagesRegex = null;
        } else {
            escapedScopes.sort();
            escapedScopes.reverse();
            this._embeddedLanguagesRegex = new RegExp('^((' + escapedScopes.join(')|(') + '))($|\\.)', '');
        }
    }

    _createClass(ScopeMetadataProvider, [{
        key: 'onDidChangeTheme',
        value: function onDidChangeTheme() {
            this._cache = Object.create(null);
            this._defaultMetaData = new ScopeMetadata('', this._initialLanguage, 0, [this._themeProvider.getDefaults()]);
        }
    }, {
        key: 'getDefaultMetadata',
        value: function getDefaultMetadata() {
            return this._defaultMetaData;
        }
    }, {
        key: 'getMetadataForScope',
        value: function getMetadataForScope(scopeName) {
            if (scopeName === null) {
                return ScopeMetadataProvider._NULL_SCOPE_METADATA;
            }
            var value = this._cache[scopeName];
            if (value) {
                return value;
            }
            value = this._doGetMetadataForScope(scopeName);
            this._cache[scopeName] = value;
            return value;
        }
    }, {
        key: '_doGetMetadataForScope',
        value: function _doGetMetadataForScope(scopeName) {
            var languageId = this._scopeToLanguage(scopeName);
            var standardTokenType = this._toStandardTokenType(scopeName);
            var themeData = this._themeProvider.themeMatch(scopeName);
            return new ScopeMetadata(scopeName, languageId, standardTokenType, themeData);
        }
    }, {
        key: '_scopeToLanguage',
        value: function _scopeToLanguage(scope) {
            if (!scope) {
                return 0;
            }
            if (!this._embeddedLanguagesRegex) {
                return 0;
            }
            var m = scope.match(this._embeddedLanguagesRegex);
            if (!m) {
                return 0;
            }
            var language = this._embeddedLanguages[m[1]] || 0;
            if (!language) {
                return 0;
            }
            return language;
        }
    }, {
        key: '_toStandardTokenType',
        value: function _toStandardTokenType(tokenType) {
            var m = tokenType.match(ScopeMetadataProvider.STANDARD_TOKEN_TYPE_REGEXP);
            if (!m) {
                return 0;
            }
            switch (m[1]) {
                case 'comment':
                    return 1;
                case 'string':
                    return 2;
                case 'regex':
                    return 4;
                case 'meta.embedded':
                    return 8;
            }
            throw new Error('Unexpected match for standard token type!');
        }
    }], [{
        key: '_escapeRegExpCharacters',
        value: function _escapeRegExpCharacters(value) {
            return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
        }
    }]);

    return ScopeMetadataProvider;
}();

ScopeMetadataProvider._NULL_SCOPE_METADATA = new ScopeMetadata('', 0, 0, null);
ScopeMetadataProvider.STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;

var Grammar = exports.Grammar = function () {
    function Grammar(grammar, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository, onigLib) {
        _classCallCheck(this, Grammar);

        this._scopeMetadataProvider = new ScopeMetadataProvider(initialLanguage, grammarRepository, embeddedLanguages);
        this._onigLib = onigLib;
        this._rootId = -1;
        this._lastRuleId = 0;
        this._ruleId2desc = [];
        this._includedGrammars = {};
        this._grammarRepository = grammarRepository;
        this._grammar = initGrammar(grammar, null);
        this._tokenTypeMatchers = [];
        if (tokenTypes) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(tokenTypes)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var selector = _step2.value;

                    var matchers = (0, _matcher.createMatchers)(selector, nameMatcher);
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = matchers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var matcher = _step3.value;

                            this._tokenTypeMatchers.push({
                                matcher: matcher.matcher,
                                type: tokenTypes[selector]
                            });
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }

    _createClass(Grammar, [{
        key: 'createOnigScanner',
        value: function createOnigScanner(sources) {
            return this._onigLib.createOnigScanner(sources);
        }
    }, {
        key: 'createOnigString',
        value: function createOnigString(sources) {
            return this._onigLib.createOnigString(sources);
        }
    }, {
        key: 'onDidChangeTheme',
        value: function onDidChangeTheme() {
            this._scopeMetadataProvider.onDidChangeTheme();
        }
    }, {
        key: 'getMetadataForScope',
        value: function getMetadataForScope(scope) {
            return this._scopeMetadataProvider.getMetadataForScope(scope);
        }
    }, {
        key: 'getInjections',
        value: function getInjections() {
            var _this = this;

            if (!this._injections) {
                this._injections = [];
                var rawInjections = this._grammar.injections;
                if (rawInjections) {
                    for (var expression in rawInjections) {
                        collectInjections(this._injections, expression, rawInjections[expression], this, this._grammar);
                    }
                }
                if (this._grammarRepository) {
                    var injectionScopeNames = this._grammarRepository.injections(this._grammar.scopeName);
                    if (injectionScopeNames) {
                        injectionScopeNames.forEach(function (injectionScopeName) {
                            var injectionGrammar = _this.getExternalGrammar(injectionScopeName);
                            if (injectionGrammar) {
                                var selector = injectionGrammar.injectionSelector;
                                if (selector) {
                                    collectInjections(_this._injections, selector, injectionGrammar, _this, injectionGrammar);
                                }
                            }
                        });
                    }
                }
                this._injections.sort(function (i1, i2) {
                    return i1.priority - i2.priority;
                });
            }
            if (this._injections.length === 0) {
                return this._injections;
            }
            return this._injections;
        }
    }, {
        key: 'registerRule',
        value: function registerRule(factory) {
            var id = ++this._lastRuleId;
            var result = factory(id);
            this._ruleId2desc[id] = result;
            return result;
        }
    }, {
        key: 'getRule',
        value: function getRule(patternId) {
            return this._ruleId2desc[patternId];
        }
    }, {
        key: 'getExternalGrammar',
        value: function getExternalGrammar(scopeName, repository) {
            if (this._includedGrammars[scopeName]) {
                return this._includedGrammars[scopeName];
            } else if (this._grammarRepository) {
                var rawIncludedGrammar = this._grammarRepository.lookup(scopeName);
                if (rawIncludedGrammar) {
                    this._includedGrammars[scopeName] = initGrammar(rawIncludedGrammar, repository && repository.$base);
                    return this._includedGrammars[scopeName];
                }
            }
        }
    }, {
        key: 'tokenizeLine',
        value: function tokenizeLine(lineText, prevState) {
            var r = this._tokenize(lineText, prevState, false);
            return {
                tokens: r.lineTokens.getResult(r.ruleStack, r.lineLength),
                ruleStack: r.ruleStack
            };
        }
    }, {
        key: 'tokenizeLine2',
        value: function tokenizeLine2(lineText, prevState) {
            var r = this._tokenize(lineText, prevState, true);
            return {
                tokens: r.lineTokens.getBinaryResult(r.ruleStack, r.lineLength),
                ruleStack: r.ruleStack
            };
        }
    }, {
        key: '_tokenize',
        value: function _tokenize(lineText, prevState, emitBinaryTokens) {
            if (this._rootId === -1) {
                this._rootId = _rule2.RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository);
            }
            var isFirstLine = void 0;
            if (!prevState || prevState === StackElement.NULL) {
                isFirstLine = true;
                var rawDefaultMetadata = this._scopeMetadataProvider.getDefaultMetadata();
                var defaultTheme = rawDefaultMetadata.themeData[0];
                var defaultMetadata = StackElementMetadata.set(0, rawDefaultMetadata.languageId, rawDefaultMetadata.tokenType, defaultTheme.fontStyle, defaultTheme.foreground, defaultTheme.background);
                var rootScopeName = this.getRule(this._rootId).getName(null, null);
                var rawRootMetadata = this._scopeMetadataProvider.getMetadataForScope(rootScopeName);
                var rootMetadata = ScopeListElement.mergeMetadata(defaultMetadata, null, rawRootMetadata);
                var scopeList = new ScopeListElement(null, rootScopeName, rootMetadata);
                prevState = new StackElement(null, this._rootId, -1, -1, null, scopeList, scopeList);
            } else {
                isFirstLine = false;
                prevState.reset();
            }
            lineText = lineText + '\n';
            var onigLineText = this.createOnigString(lineText);
            var lineLength = onigLineText.content.length;
            var lineTokens = new LineTokens(emitBinaryTokens, lineText, this._tokenTypeMatchers);
            var nextState = _tokenizeString(this, onigLineText, isFirstLine, 0, prevState, lineTokens);
            disposeOnigString(onigLineText);
            return {
                lineLength: lineLength,
                lineTokens: lineTokens,
                ruleStack: nextState
            };
        }
    }]);

    return Grammar;
}();

function disposeOnigString(str) {
    if (typeof str.dispose === 'function') {
        str.dispose();
    }
}

function initGrammar(grammar, base) {
    grammar = (0, _utils.clone)(grammar);
    grammar.repository = grammar.repository || {};
    grammar.repository.$self = {
        $vscodeTextmateLocation: grammar.$vscodeTextmateLocation,
        patterns: grammar.patterns,
        name: grammar.scopeName
    };
    grammar.repository.$base = base || grammar.repository.$self;
    return grammar;
}

function handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, captures, captureIndices) {
    if (captures.length === 0) {
        return;
    }
    var lineTextContent = lineText.content;
    var len = Math.min(captures.length, captureIndices.length);
    var localStack = [];
    var maxEnd = captureIndices[0].end;
    for (var i = 0; i < len; i++) {
        var captureRule = captures[i];
        if (captureRule === null) {
            continue;
        }
        var captureIndex = captureIndices[i];
        if (captureIndex.length === 0) {
            continue;
        }
        if (captureIndex.start > maxEnd) {
            break;
        }
        while (localStack.length > 0 && localStack[localStack.length - 1].endPos <= captureIndex.start) {
            lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
            localStack.pop();
        }
        if (localStack.length > 0) {
            lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, captureIndex.start);
        } else {
            lineTokens.produce(stack, captureIndex.start);
        }
        if (captureRule.retokenizeCapturedWithRuleId) {
            var scopeName = captureRule.getName(lineTextContent, captureIndices);
            var nameScopesList = stack.contentNameScopesList.push(grammar, scopeName);
            var contentName = captureRule.getContentName(lineTextContent, captureIndices);
            var contentNameScopesList = nameScopesList.push(grammar, contentName);
            var stackClone = stack.push(captureRule.retokenizeCapturedWithRuleId, captureIndex.start, -1, null, nameScopesList, contentNameScopesList);
            var onigSubStr = grammar.createOnigString(lineTextContent.substring(0, captureIndex.end));
            _tokenizeString(grammar, onigSubStr, isFirstLine && captureIndex.start === 0, captureIndex.start, stackClone, lineTokens);
            disposeOnigString(onigSubStr);
            continue;
        }
        var captureRuleScopeName = captureRule.getName(lineTextContent, captureIndices);
        if (captureRuleScopeName !== null) {
            var base = localStack.length > 0 ? localStack[localStack.length - 1].scopes : stack.contentNameScopesList;
            var captureRuleScopesList = base.push(grammar, captureRuleScopeName);
            localStack.push(new LocalStackElement(captureRuleScopesList, captureIndex.end));
        }
    }
    while (localStack.length > 0) {
        lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
        localStack.pop();
    }
}

function matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
    var bestMatchRating = Number.MAX_VALUE;
    var bestMatchCaptureIndices = null;
    var bestMatchRuleId = void 0;
    var bestMatchResultPriority = 0;
    var scopes = stack.contentNameScopesList.generateScopes();
    for (var i = 0, len = injections.length; i < len; i++) {
        var injection = injections[i];
        if (!injection.matcher(scopes)) {
            continue;
        }
        var ruleScanner = grammar.getRule(injection.ruleId).compile(grammar, null, isFirstLine, linePos === anchorPosition);
        var matchResult = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
        if (!matchResult) {
            continue;
        }
        var matchRating = matchResult.captureIndices[0].start;
        if (matchRating >= bestMatchRating) {
            continue;
        }
        bestMatchRating = matchRating;
        bestMatchCaptureIndices = matchResult.captureIndices;
        bestMatchRuleId = ruleScanner.rules[matchResult.index];
        bestMatchResultPriority = injection.priority;
        if (bestMatchRating === linePos) {
            break;
        }
    }
    if (bestMatchCaptureIndices) {
        return {
            priorityMatch: bestMatchResultPriority === -1,
            captureIndices: bestMatchCaptureIndices,
            matchedRuleId: bestMatchRuleId
        };
    }
    return null;
}

function matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
    var rule = stack.getRule(grammar);
    var ruleScanner = rule.compile(grammar, stack.endRule, isFirstLine, linePos === anchorPosition);
    var r = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
    if (r) {
        return {
            captureIndices: r.captureIndices,
            matchedRuleId: ruleScanner.rules[r.index]
        };
    }
    return null;
}

function matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
    var matchResult = matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
    var injections = grammar.getInjections();
    if (injections.length === 0) {
        return matchResult;
    }
    var injectionResult = matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
    if (!injectionResult) {
        return matchResult;
    }
    if (!matchResult) {
        return injectionResult;
    }
    var matchResultScore = matchResult.captureIndices[0].start;
    var injectionResultScore = injectionResult.captureIndices[0].start;
    if (injectionResultScore < matchResultScore || injectionResult.priorityMatch && injectionResultScore === matchResultScore) {
        return injectionResult;
    }
    return matchResult;
}

function _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens) {
    var anchorPosition = -1;
    var whileRules = [];
    for (var node = stack; node; node = node.pop()) {
        var nodeRule = node.getRule(grammar);
        if (nodeRule instanceof _rule2.BeginWhileRule) {
            whileRules.push({
                rule: nodeRule,
                stack: node
            });
        }
    }
    for (var whileRule = whileRules.pop(); whileRule; whileRule = whileRules.pop()) {
        var ruleScanner = whileRule.rule.compileWhile(grammar, whileRule.stack.endRule, isFirstLine, anchorPosition === linePos);
        var r = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
        if (r) {
            var matchedRuleId = ruleScanner.rules[r.index];
            if (matchedRuleId !== -2) {
                stack = whileRule.stack.pop();
                break;
            }
            if (r.captureIndices && r.captureIndices.length) {
                lineTokens.produce(whileRule.stack, r.captureIndices[0].start);
                handleCaptures(grammar, lineText, isFirstLine, whileRule.stack, lineTokens, whileRule.rule.whileCaptures, r.captureIndices);
                lineTokens.produce(whileRule.stack, r.captureIndices[0].end);
                anchorPosition = r.captureIndices[0].end;
                if (r.captureIndices[0].end > linePos) {
                    linePos = r.captureIndices[0].end;
                    isFirstLine = false;
                }
            }
        } else {
            stack = whileRule.stack.pop();
            break;
        }
    }
    return { stack: stack, linePos: linePos, anchorPosition: anchorPosition, isFirstLine: isFirstLine };
}

function _tokenizeString(grammar, lineText, isFirstLine, linePos, stack, lineTokens) {
    var lineLength = lineText.content.length;
    var STOP = false;
    var whileCheckResult = _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens);
    stack = whileCheckResult.stack;
    linePos = whileCheckResult.linePos;
    isFirstLine = whileCheckResult.isFirstLine;
    var anchorPosition = whileCheckResult.anchorPosition;
    while (!STOP) {
        scanNext();
    }
    function scanNext() {
        var r = matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
        if (!r) {
            lineTokens.produce(stack, lineLength);
            STOP = true;
            return;
        }
        var captureIndices = r.captureIndices;
        var matchedRuleId = r.matchedRuleId;
        var hasAdvanced = captureIndices && captureIndices.length > 0 ? captureIndices[0].end > linePos : false;
        if (matchedRuleId === -1) {
            var poppedRule = stack.getRule(grammar);
            lineTokens.produce(stack, captureIndices[0].start);
            stack = stack.setContentNameScopesList(stack.nameScopesList);
            handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, poppedRule.endCaptures, captureIndices);
            lineTokens.produce(stack, captureIndices[0].end);
            var popped = stack;
            stack = stack.pop();
            anchorPosition = popped.getAnchorPos();
            if (!hasAdvanced && popped.getEnterPos() === linePos) {
                console.error('[1] - Grammar is in an endless loop - Grammar pushed & popped a rule without advancing');
                stack = popped;
                lineTokens.produce(stack, lineLength);
                STOP = true;
                return;
            }
        } else {
            var _rule = grammar.getRule(matchedRuleId);
            lineTokens.produce(stack, captureIndices[0].start);
            var beforePush = stack;
            var scopeName = _rule.getName(lineText.content, captureIndices);
            var nameScopesList = stack.contentNameScopesList.push(grammar, scopeName);
            stack = stack.push(matchedRuleId, linePos, anchorPosition, null, nameScopesList, nameScopesList);
            if (_rule instanceof _rule2.BeginEndRule) {
                var pushedRule = _rule;
                handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
                lineTokens.produce(stack, captureIndices[0].end);
                anchorPosition = captureIndices[0].end;
                var contentName = pushedRule.getContentName(lineText.content, captureIndices);
                var contentNameScopesList = nameScopesList.push(grammar, contentName);
                stack = stack.setContentNameScopesList(contentNameScopesList);
                if (pushedRule.endHasBackReferences) {
                    stack = stack.setEndRule(pushedRule.getEndWithResolvedBackReferences(lineText.content, captureIndices));
                }
                if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
                    console.error('[2] - Grammar is in an endless loop - Grammar pushed the same rule without advancing');
                    stack = stack.pop();
                    lineTokens.produce(stack, lineLength);
                    STOP = true;
                    return;
                }
            } else if (_rule instanceof _rule2.BeginWhileRule) {
                var _pushedRule = _rule;
                handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, _pushedRule.beginCaptures, captureIndices);
                lineTokens.produce(stack, captureIndices[0].end);
                anchorPosition = captureIndices[0].end;
                var _contentName = _pushedRule.getContentName(lineText.content, captureIndices);
                var _contentNameScopesList = nameScopesList.push(grammar, _contentName);
                stack = stack.setContentNameScopesList(_contentNameScopesList);
                if (_pushedRule.whileHasBackReferences) {
                    stack = stack.setEndRule(_pushedRule.getWhileWithResolvedBackReferences(lineText.content, captureIndices));
                }
                if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
                    console.error('[3] - Grammar is in an endless loop - Grammar pushed the same rule without advancing');
                    stack = stack.pop();
                    lineTokens.produce(stack, lineLength);
                    STOP = true;
                    return;
                }
            } else {
                var matchingRule = _rule;
                handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, matchingRule.captures, captureIndices);
                lineTokens.produce(stack, captureIndices[0].end);
                stack = stack.pop();
                if (!hasAdvanced) {
                    console.error('[4] - Grammar is in an endless loop - Grammar is not advancing, nor is it pushing/popping');
                    stack = stack.safePop();
                    lineTokens.produce(stack, lineLength);
                    STOP = true;
                    return;
                }
            }
        }
        if (captureIndices[0].end > linePos) {
            linePos = captureIndices[0].end;
            isFirstLine = false;
        }
    }
    return stack;
}

var StackElementMetadata = exports.StackElementMetadata = function () {
    function StackElementMetadata() {
        _classCallCheck(this, StackElementMetadata);
    }

    _createClass(StackElementMetadata, null, [{
        key: 'toBinaryStr',
        value: function toBinaryStr(metadata) {
            var r = metadata.toString(2);
            while (r.length < 32) {
                r = '0' + r;
            }
            return r;
        }
    }, {
        key: 'printMetadata',
        value: function printMetadata(metadata) {
            var languageId = StackElementMetadata.getLanguageId(metadata);
            var tokenType = StackElementMetadata.getTokenType(metadata);
            var fontStyle = StackElementMetadata.getFontStyle(metadata);
            var foreground = StackElementMetadata.getForeground(metadata);
            var background = StackElementMetadata.getBackground(metadata);
            console.log({
                languageId: languageId,
                tokenType: tokenType,
                fontStyle: fontStyle,
                foreground: foreground,
                background: background
            });
        }
    }, {
        key: 'getLanguageId',
        value: function getLanguageId(metadata) {
            return (metadata & 255) >>> 0;
        }
    }, {
        key: 'getTokenType',
        value: function getTokenType(metadata) {
            return (metadata & 1792) >>> 8;
        }
    }, {
        key: 'getFontStyle',
        value: function getFontStyle(metadata) {
            return (metadata & 14336) >>> 11;
        }
    }, {
        key: 'getForeground',
        value: function getForeground(metadata) {
            return (metadata & 8372224) >>> 14;
        }
    }, {
        key: 'getBackground',
        value: function getBackground(metadata) {
            return (metadata & 4286578688) >>> 23;
        }
    }, {
        key: 'set',
        value: function set(metadata, languageId, tokenType, fontStyle, foreground, background) {
            var _languageId = StackElementMetadata.getLanguageId(metadata);
            var _tokenType = StackElementMetadata.getTokenType(metadata);
            var _fontStyle = StackElementMetadata.getFontStyle(metadata);
            var _foreground = StackElementMetadata.getForeground(metadata);
            var _background = StackElementMetadata.getBackground(metadata);
            if (languageId !== 0) {
                _languageId = languageId;
            }
            if (tokenType !== 0) {
                _tokenType = tokenType === 8 ? 0 : tokenType;
            }
            if (fontStyle !== -1) {
                _fontStyle = fontStyle;
            }
            if (foreground !== 0) {
                _foreground = foreground;
            }
            if (background !== 0) {
                _background = background;
            }
            return (_languageId << 0 | _tokenType << 8 | _fontStyle << 11 | _foreground << 14 | _background << 23) >>> 0;
        }
    }]);

    return StackElementMetadata;
}();

var ScopeListElement = exports.ScopeListElement = function () {
    function ScopeListElement(parent, scope, metadata) {
        _classCallCheck(this, ScopeListElement);

        this.parent = parent;
        this.scope = scope;
        this.metadata = metadata;
    }

    _createClass(ScopeListElement, [{
        key: 'equals',
        value: function equals(other) {
            return ScopeListElement._equals(this, other);
        }
    }, {
        key: 'push',
        value: function push(grammar, scope) {
            if (scope === null) {
                return this;
            }
            if (scope.indexOf(' ') >= 0) {
                return ScopeListElement._push(this, grammar, scope.split(/ /g));
            }
            return ScopeListElement._push(this, grammar, [scope]);
        }
    }, {
        key: 'generateScopes',
        value: function generateScopes() {
            return ScopeListElement._generateScopes(this);
        }
    }], [{
        key: '_equals',
        value: function _equals(a, b) {
            do {
                if (a === b) {
                    return true;
                }
                if (a.scope !== b.scope || a.metadata !== b.metadata) {
                    return false;
                }
                a = a.parent;
                b = b.parent;
                if (!a && !b) {
                    return true;
                }
                if (!a || !b) {
                    return false;
                }
            } while (true);
        }
    }, {
        key: '_matchesScope',
        value: function _matchesScope(scope, selector, selectorWithDot) {
            return selector === scope || scope.substring(0, selectorWithDot.length) === selectorWithDot;
        }
    }, {
        key: '_matches',
        value: function _matches(target, parentScopes) {
            if (parentScopes === null) {
                return true;
            }
            var len = parentScopes.length;
            var index = 0;
            var selector = parentScopes[index];
            var selectorWithDot = selector + '.';
            while (target) {
                if (this._matchesScope(target.scope, selector, selectorWithDot)) {
                    index++;
                    if (index === len) {
                        return true;
                    }
                    selector = parentScopes[index];
                    selectorWithDot = selector + '.';
                }
                target = target.parent;
            }
            return false;
        }
    }, {
        key: 'mergeMetadata',
        value: function mergeMetadata(metadata, scopesList, source) {
            if (source === null) {
                return metadata;
            }
            var fontStyle = -1;
            var foreground = 0;
            var background = 0;
            if (source.themeData !== null) {
                for (var i = 0, len = source.themeData.length; i < len; i++) {
                    var themeData = source.themeData[i];
                    if (this._matches(scopesList, themeData.parentScopes)) {
                        fontStyle = themeData.fontStyle;
                        foreground = themeData.foreground;
                        background = themeData.background;
                        break;
                    }
                }
            }
            return StackElementMetadata.set(metadata, source.languageId, source.tokenType, fontStyle, foreground, background);
        }
    }, {
        key: '_push',
        value: function _push(target, grammar, scopes) {
            for (var i = 0, len = scopes.length; i < len; i++) {
                var scope = scopes[i];
                var rawMetadata = grammar.getMetadataForScope(scope);
                var metadata = ScopeListElement.mergeMetadata(target.metadata, target, rawMetadata);
                target = new ScopeListElement(target, scope, metadata);
            }
            return target;
        }
    }, {
        key: '_generateScopes',
        value: function _generateScopes(scopesList) {
            var result = [],
                resultLen = 0;
            while (scopesList) {
                result[resultLen++] = scopesList.scope;
                scopesList = scopesList.parent;
            }
            result.reverse();
            return result;
        }
    }]);

    return ScopeListElement;
}();

var StackElement = exports.StackElement = function () {
    function StackElement(parent, ruleId, enterPos, anchorPos, endRule, nameScopesList, contentNameScopesList) {
        _classCallCheck(this, StackElement);

        this.parent = parent;
        this.depth = this.parent ? this.parent.depth + 1 : 1;
        this.ruleId = ruleId;
        this._enterPos = enterPos;
        this._anchorPos = anchorPos;
        this.endRule = endRule;
        this.nameScopesList = nameScopesList;
        this.contentNameScopesList = contentNameScopesList;
    }

    _createClass(StackElement, [{
        key: 'clone',
        value: function clone() {
            return this;
        }
    }, {
        key: 'equals',
        value: function equals(other) {
            if (other === null) {
                return false;
            }
            return StackElement._equals(this, other);
        }
    }, {
        key: 'reset',
        value: function reset() {
            StackElement._reset(this);
        }
    }, {
        key: 'pop',
        value: function pop() {
            return this.parent;
        }
    }, {
        key: 'safePop',
        value: function safePop() {
            if (this.parent) {
                return this.parent;
            }
            return this;
        }
    }, {
        key: 'push',
        value: function push(ruleId, enterPos, anchorPos, endRule, nameScopesList, contentNameScopesList) {
            return new StackElement(this, ruleId, enterPos, anchorPos, endRule, nameScopesList, contentNameScopesList);
        }
    }, {
        key: 'getEnterPos',
        value: function getEnterPos() {
            return this._enterPos;
        }
    }, {
        key: 'getAnchorPos',
        value: function getAnchorPos() {
            return this._anchorPos;
        }
    }, {
        key: 'getRule',
        value: function getRule(grammar) {
            return grammar.getRule(this.ruleId);
        }
    }, {
        key: '_writeString',
        value: function _writeString(res, outIndex) {
            if (this.parent) {
                outIndex = this.parent._writeString(res, outIndex);
            }
            res[outIndex++] = '(' + this.ruleId + ', TODO-' + this.nameScopesList + ', TODO-' + this.contentNameScopesList + ')';
            return outIndex;
        }
    }, {
        key: 'toString',
        value: function toString() {
            var r = [];
            this._writeString(r, 0);
            return '[' + r.join(',') + ']';
        }
    }, {
        key: 'setContentNameScopesList',
        value: function setContentNameScopesList(contentNameScopesList) {
            if (this.contentNameScopesList === contentNameScopesList) {
                return this;
            }
            return this.parent.push(this.ruleId, this._enterPos, this._anchorPos, this.endRule, this.nameScopesList, contentNameScopesList);
        }
    }, {
        key: 'setEndRule',
        value: function setEndRule(endRule) {
            if (this.endRule === endRule) {
                return this;
            }
            return new StackElement(this.parent, this.ruleId, this._enterPos, this._anchorPos, endRule, this.nameScopesList, this.contentNameScopesList);
        }
    }, {
        key: 'hasSameRuleAs',
        value: function hasSameRuleAs(other) {
            return this.ruleId === other.ruleId;
        }
    }], [{
        key: '_structuralEquals',
        value: function _structuralEquals(a, b) {
            do {
                if (a === b) {
                    return true;
                }
                if (a.depth !== b.depth || a.ruleId !== b.ruleId || a.endRule !== b.endRule) {
                    return false;
                }
                a = a.parent;
                b = b.parent;
                if (!a && !b) {
                    return true;
                }
                if (!a || !b) {
                    return false;
                }
            } while (true);
        }
    }, {
        key: '_equals',
        value: function _equals(a, b) {
            if (a === b) {
                return true;
            }
            if (!this._structuralEquals(a, b)) {
                return false;
            }
            return a.contentNameScopesList.equals(b.contentNameScopesList);
        }
    }, {
        key: '_reset',
        value: function _reset(el) {
            while (el) {
                el._enterPos = -1;
                el._anchorPos = -1;
                el = el.parent;
            }
        }
    }]);

    return StackElement;
}();

StackElement.NULL = new StackElement(null, 0, 0, 0, null, null, null);

var LocalStackElement = exports.LocalStackElement = function LocalStackElement(scopes, endPos) {
    _classCallCheck(this, LocalStackElement);

    this.scopes = scopes;
    this.endPos = endPos;
};

var LineTokens = function () {
    function LineTokens(emitBinaryTokens, lineText, tokenTypeOverrides) {
        _classCallCheck(this, LineTokens);

        this._emitBinaryTokens = emitBinaryTokens;
        this._tokenTypeOverrides = tokenTypeOverrides;
        if (this._emitBinaryTokens) {
            this._binaryTokens = [];
        } else {
            this._tokens = [];
        }
        this._lastTokenEndIndex = 0;
    }

    _createClass(LineTokens, [{
        key: 'produce',
        value: function produce(stack, endIndex) {
            this.produceFromScopes(stack.contentNameScopesList, endIndex);
        }
    }, {
        key: 'produceFromScopes',
        value: function produceFromScopes(scopesList, endIndex) {
            if (this._lastTokenEndIndex >= endIndex) {
                return;
            }
            if (this._emitBinaryTokens) {
                var metadata = scopesList.metadata;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = this._tokenTypeOverrides[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var tokenType = _step4.value;

                        if (tokenType.matcher(scopesList.generateScopes())) {
                            metadata = StackElementMetadata.set(metadata, 0, toTemporaryType(tokenType.type), -1, 0, 0);
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === metadata) {
                    this._lastTokenEndIndex = endIndex;
                    return;
                }
                this._binaryTokens.push(this._lastTokenEndIndex);
                this._binaryTokens.push(metadata);
                this._lastTokenEndIndex = endIndex;
                return;
            }
            var scopes = scopesList.generateScopes();
            this._tokens.push({
                startIndex: this._lastTokenEndIndex,
                endIndex: endIndex,
                scopes: scopes
            });
            this._lastTokenEndIndex = endIndex;
        }
    }, {
        key: 'getResult',
        value: function getResult(stack, lineLength) {
            if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === lineLength - 1) {
                this._tokens.pop();
            }
            if (this._tokens.length === 0) {
                this._lastTokenEndIndex = -1;
                this.produce(stack, lineLength);
                this._tokens[this._tokens.length - 1].startIndex = 0;
            }
            return this._tokens;
        }
    }, {
        key: 'getBinaryResult',
        value: function getBinaryResult(stack, lineLength) {
            if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === lineLength - 1) {
                this._binaryTokens.pop();
                this._binaryTokens.pop();
            }
            if (this._binaryTokens.length === 0) {
                this._lastTokenEndIndex = -1;
                this.produce(stack, lineLength);
                this._binaryTokens[this._binaryTokens.length - 2] = 0;
            }
            var result = new Uint32Array(this._binaryTokens.length);
            for (var i = 0, len = this._binaryTokens.length; i < len; i++) {
                result[i] = this._binaryTokens[i];
            }
            return result;
        }
    }]);

    return LineTokens;
}();

function toTemporaryType(standardType) {
    switch (standardType) {
        case 4:
            return 4;
        case 2:
            return 2;
        case 1:
            return 1;
        case 0:
        default:
            return 8;
    }
}