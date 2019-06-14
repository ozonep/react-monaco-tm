"use strict";
import { clone } from './utils';
import { RuleFactory, BeginEndRule, BeginWhileRule } from './rule';
import { createMatchers } from './matcher';

export function createGrammar(grammar, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository, onigLib) {
    return new Grammar(grammar, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository, onigLib);
}

function _extractIncludedScopesInPatterns(result, patterns) {
    for (let i = 0, len = patterns.length; i < len; i++) {
        if (Array.isArray(patterns[i].patterns)) {
            _extractIncludedScopesInPatterns(result, patterns[i].patterns);
        }
        let include = patterns[i].include;
        if (!include) continue;
        if (include === '$base' || include === '$self') continue;
        if (include.charAt(0) === '#') continue;
        let sharpIndex = include.indexOf('#');
        if (sharpIndex >= 0) {
            result[include.substring(0, sharpIndex)] = true;
        }
        else {
            result[include] = true;
        }
    }
}

function _extractIncludedScopesInRepository(result, repository) {
    for (let name in repository) {
        let rule = repository[name];
        if (rule.patterns && Array.isArray(rule.patterns)) {
            _extractIncludedScopesInPatterns(result, rule.patterns);
        }
        if (rule.repository) {
            _extractIncludedScopesInRepository(result, rule.repository);
        }
    }
}

export function collectIncludedScopes(result, grammar) {
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
    return identifers.every(identifier => {
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
    let matchers = createMatchers(selector, nameMatcher);
    let ruleId = RuleFactory.getCompiledRuleId(rule, ruleFactoryHelper, grammar.repository);
    for (let matcher of matchers) {
        result.push({
            matcher: matcher.matcher,
            ruleId: ruleId,
            grammar: grammar,
            priority: matcher.priority
        });
    }
}

export class ScopeMetadata {
    constructor(scopeName, languageId, tokenType, themeData) {
        this.scopeName = scopeName;
        this.languageId = languageId;
        this.tokenType = tokenType;
        this.themeData = themeData;
    }
}

class ScopeMetadataProvider {
    constructor(initialLanguage, themeProvider, embeddedLanguages) {
        this._initialLanguage = initialLanguage;
        this._themeProvider = themeProvider;
        this.onDidChangeTheme();
        this._embeddedLanguages = Object.create(null);
        if (embeddedLanguages) {
            let scopes = Object.keys(embeddedLanguages);
            for (let i = 0, len = scopes.length; i < len; i++) {
                let scope = scopes[i];
                let language = embeddedLanguages[scope];
                if (typeof language !== 'number' || language === 0) {
                    console.warn('Invalid embedded language found at scope ' + scope + ': <<' + language + '>>');
                    continue;
                }
                this._embeddedLanguages[scope] = language;
            }
        }
        let escapedScopes = Object.keys(this._embeddedLanguages).map((scopeName) => ScopeMetadataProvider._escapeRegExpCharacters(scopeName));
        if (escapedScopes.length === 0) {
            this._embeddedLanguagesRegex = null;
        }
        else {
            escapedScopes.sort();
            escapedScopes.reverse();
            this._embeddedLanguagesRegex = new RegExp(`^((${escapedScopes.join(')|(')}))($|\\.)`, '');
        }
    }
    onDidChangeTheme() {
        this._cache = Object.create(null);
        this._defaultMetaData = new ScopeMetadata('', this._initialLanguage, 0, [this._themeProvider.getDefaults()]);
    }
    getDefaultMetadata() {
        return this._defaultMetaData;
    }
    static _escapeRegExpCharacters(value) {
        return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
    }
    getMetadataForScope(scopeName) {
        if (scopeName === null) {
            return ScopeMetadataProvider._NULL_SCOPE_METADATA;
        }
        let value = this._cache[scopeName];
        if (value) {
            return value;
        }
        value = this._doGetMetadataForScope(scopeName);
        this._cache[scopeName] = value;
        return value;
    }
    _doGetMetadataForScope(scopeName) {
        let languageId = this._scopeToLanguage(scopeName);
        let standardTokenType = this._toStandardTokenType(scopeName);
        let themeData = this._themeProvider.themeMatch(scopeName);
        return new ScopeMetadata(scopeName, languageId, standardTokenType, themeData);
    }
    _scopeToLanguage(scope) {
        if (!scope) {
            return 0;
        }
        if (!this._embeddedLanguagesRegex) {
            return 0;
        }
        let m = scope.match(this._embeddedLanguagesRegex);
        if (!m) {
            return 0;
        }
        let language = this._embeddedLanguages[m[1]] || 0;
        if (!language) {
            return 0;
        }
        return language;
    }
    _toStandardTokenType(tokenType) {
        let m = tokenType.match(ScopeMetadataProvider.STANDARD_TOKEN_TYPE_REGEXP);
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
}

ScopeMetadataProvider._NULL_SCOPE_METADATA = new ScopeMetadata('', 0, 0, null);
ScopeMetadataProvider.STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;

export class Grammar {
    constructor(grammar, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository, onigLib) {
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
            for (const selector of Object.keys(tokenTypes)) {
                const matchers = createMatchers(selector, nameMatcher);
                for (const matcher of matchers) {
                    this._tokenTypeMatchers.push({
                        matcher: matcher.matcher,
                        type: tokenTypes[selector]
                    });
                }
            }
        }
    }
    createOnigScanner(sources) {
        return this._onigLib.createOnigScanner(sources);
    }
    createOnigString(sources) {
        return this._onigLib.createOnigString(sources);
    }
    onDidChangeTheme() {
        this._scopeMetadataProvider.onDidChangeTheme();
    }
    getMetadataForScope(scope) {
        return this._scopeMetadataProvider.getMetadataForScope(scope);
    }
    getInjections() {
        if (!this._injections) {
            this._injections = [];
            var rawInjections = this._grammar.injections;
            if (rawInjections) {
                for (var expression in rawInjections) {
                    collectInjections(this._injections, expression, rawInjections[expression], this, this._grammar);
                }
            }
            if (this._grammarRepository) {
                let injectionScopeNames = this._grammarRepository.injections(this._grammar.scopeName);
                if (injectionScopeNames) {
                    injectionScopeNames.forEach(injectionScopeName => {
                        let injectionGrammar = this.getExternalGrammar(injectionScopeName);
                        if (injectionGrammar) {
                            let selector = injectionGrammar.injectionSelector;
                            if (selector) {
                                collectInjections(this._injections, selector, injectionGrammar, this, injectionGrammar);
                            }
                        }
                    });
                }
            }
            this._injections.sort((i1, i2) => i1.priority - i2.priority);
        }
        if (this._injections.length === 0) {
            return this._injections;
        }
        return this._injections;
    }
    registerRule(factory) {
        let id = (++this._lastRuleId);
        let result = factory(id);
        this._ruleId2desc[id] = result;
        return result;
    }
    getRule(patternId) {
        return this._ruleId2desc[patternId];
    }
    getExternalGrammar(scopeName, repository) {
        if (this._includedGrammars[scopeName]) {
            return this._includedGrammars[scopeName];
        }
        else if (this._grammarRepository) {
            let rawIncludedGrammar = this._grammarRepository.lookup(scopeName);
            if (rawIncludedGrammar) {
                this._includedGrammars[scopeName] = initGrammar(rawIncludedGrammar, repository && repository.$base);
                return this._includedGrammars[scopeName];
            }
        }
    }
    tokenizeLine(lineText, prevState) {
        let r = this._tokenize(lineText, prevState, false);
        return {
            tokens: r.lineTokens.getResult(r.ruleStack, r.lineLength),
            ruleStack: r.ruleStack
        };
    }
    tokenizeLine2(lineText, prevState) {
        let r = this._tokenize(lineText, prevState, true);
        return {
            tokens: r.lineTokens.getBinaryResult(r.ruleStack, r.lineLength),
            ruleStack: r.ruleStack
        };
    }
    _tokenize(lineText, prevState, emitBinaryTokens) {
        if (this._rootId === -1) {
            this._rootId = RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository);
        }
        let isFirstLine;
        if (!prevState || prevState === StackElement.NULL) {
            isFirstLine = true;
            let rawDefaultMetadata = this._scopeMetadataProvider.getDefaultMetadata();
            let defaultTheme = rawDefaultMetadata.themeData[0];
            let defaultMetadata = StackElementMetadata.set(0, rawDefaultMetadata.languageId, rawDefaultMetadata.tokenType, defaultTheme.fontStyle, defaultTheme.foreground, defaultTheme.background);
            let rootScopeName = this.getRule(this._rootId).getName(null, null);
            let rawRootMetadata = this._scopeMetadataProvider.getMetadataForScope(rootScopeName);
            let rootMetadata = ScopeListElement.mergeMetadata(defaultMetadata, null, rawRootMetadata);
            let scopeList = new ScopeListElement(null, rootScopeName, rootMetadata);
            prevState = new StackElement(null, this._rootId, -1, -1, null, scopeList, scopeList);
        }
        else {
            isFirstLine = false;
            prevState.reset();
        }
        lineText = lineText + '\n';
        let onigLineText = this.createOnigString(lineText);
        let lineLength = onigLineText.content.length;
        let lineTokens = new LineTokens(emitBinaryTokens, lineText, this._tokenTypeMatchers);
        let nextState = _tokenizeString(this, onigLineText, isFirstLine, 0, prevState, lineTokens);
        disposeOnigString(onigLineText);
        return {
            lineLength: lineLength,
            lineTokens: lineTokens,
            ruleStack: nextState
        };
    }
}

function disposeOnigString(str) {
    if (typeof str.dispose === 'function') {
        str.dispose();
    }
}

function initGrammar(grammar, base) {
    grammar = clone(grammar);
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
    let lineTextContent = lineText.content;
    let len = Math.min(captures.length, captureIndices.length);
    let localStack = [];
    let maxEnd = captureIndices[0].end;
    for (let i = 0; i < len; i++) {
        let captureRule = captures[i];
        if (captureRule === null) {
            continue;
        }
        let captureIndex = captureIndices[i];
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
        }
        else {
            lineTokens.produce(stack, captureIndex.start);
        }
        if (captureRule.retokenizeCapturedWithRuleId) {
            let scopeName = captureRule.getName(lineTextContent, captureIndices);
            let nameScopesList = stack.contentNameScopesList.push(grammar, scopeName);
            let contentName = captureRule.getContentName(lineTextContent, captureIndices);
            let contentNameScopesList = nameScopesList.push(grammar, contentName);
            let stackClone = stack.push(captureRule.retokenizeCapturedWithRuleId, captureIndex.start, -1, null, nameScopesList, contentNameScopesList);
            let onigSubStr = grammar.createOnigString(lineTextContent.substring(0, captureIndex.end));
            _tokenizeString(grammar, onigSubStr, (isFirstLine && captureIndex.start === 0), captureIndex.start, stackClone, lineTokens);
            disposeOnigString(onigSubStr);
            continue;
        }
        let captureRuleScopeName = captureRule.getName(lineTextContent, captureIndices);
        if (captureRuleScopeName !== null) {
            let base = localStack.length > 0 ? localStack[localStack.length - 1].scopes : stack.contentNameScopesList;
            let captureRuleScopesList = base.push(grammar, captureRuleScopeName);
            localStack.push(new LocalStackElement(captureRuleScopesList, captureIndex.end));
        }
    }
    while (localStack.length > 0) {
        lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
        localStack.pop();
    }
}

function matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
    let bestMatchRating = Number.MAX_VALUE;
    let bestMatchCaptureIndices = null;
    let bestMatchRuleId;
    let bestMatchResultPriority = 0;
    let scopes = stack.contentNameScopesList.generateScopes();
    for (let i = 0, len = injections.length; i < len; i++) {
        let injection = injections[i];
        if (!injection.matcher(scopes)) {
            continue;
        }
        let ruleScanner = grammar.getRule(injection.ruleId).compile(grammar, null, isFirstLine, linePos === anchorPosition);
        let matchResult = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
        if (!matchResult) {
            continue;
        }
        let matchRating = matchResult.captureIndices[0].start;
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
    let rule = stack.getRule(grammar);
    let ruleScanner = rule.compile(grammar, stack.endRule, isFirstLine, linePos === anchorPosition);
    let r = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
    if (r) {
        return {
            captureIndices: r.captureIndices,
            matchedRuleId: ruleScanner.rules[r.index]
        };
    }
    return null;
}

function matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
    let matchResult = matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
    let injections = grammar.getInjections();
    if (injections.length === 0) {
        return matchResult;
    }
    let injectionResult = matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
    if (!injectionResult) {
        return matchResult;
    }
    if (!matchResult) {
        return injectionResult;
    }
    let matchResultScore = matchResult.captureIndices[0].start;
    let injectionResultScore = injectionResult.captureIndices[0].start;
    if (injectionResultScore < matchResultScore || (injectionResult.priorityMatch && injectionResultScore === matchResultScore)) {
        return injectionResult;
    }
    return matchResult;
}

function _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens) {
    let anchorPosition = -1;
    let whileRules = [];
    for (let node = stack; node; node = node.pop()) {
        let nodeRule = node.getRule(grammar);
        if (nodeRule instanceof BeginWhileRule) {
            whileRules.push({
                rule: nodeRule,
                stack: node
            });
        }
    }
    for (let whileRule = whileRules.pop(); whileRule; whileRule = whileRules.pop()) {
        let ruleScanner = whileRule.rule.compileWhile(grammar, whileRule.stack.endRule, isFirstLine, anchorPosition === linePos);
        let r = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
        if (r) {
            let matchedRuleId = ruleScanner.rules[r.index];
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
        }
        else {
            stack = whileRule.stack.pop();
            break;
        }
    }
    return { stack: stack, linePos: linePos, anchorPosition: anchorPosition, isFirstLine: isFirstLine };
}

function _tokenizeString(grammar, lineText, isFirstLine, linePos, stack, lineTokens) {
    const lineLength = lineText.content.length;
    let STOP = false;
    let whileCheckResult = _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens);
    stack = whileCheckResult.stack;
    linePos = whileCheckResult.linePos;
    isFirstLine = whileCheckResult.isFirstLine;
    let anchorPosition = whileCheckResult.anchorPosition;
    while (!STOP) {
        scanNext();
    }
    function scanNext() {
        let r = matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
        if (!r) {
            lineTokens.produce(stack, lineLength);
            STOP = true;
            return;
        }
        let captureIndices = r.captureIndices;
        let matchedRuleId = r.matchedRuleId;
        let hasAdvanced = (captureIndices && captureIndices.length > 0) ? (captureIndices[0].end > linePos) : false;
        if (matchedRuleId === -1) {
            let poppedRule = stack.getRule(grammar);
            lineTokens.produce(stack, captureIndices[0].start);
            stack = stack.setContentNameScopesList(stack.nameScopesList);
            handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, poppedRule.endCaptures, captureIndices);
            lineTokens.produce(stack, captureIndices[0].end);
            let popped = stack;
            stack = stack.pop();
            anchorPosition = popped.getAnchorPos();
            if (!hasAdvanced && popped.getEnterPos() === linePos) {
                console.error('[1] - Grammar is in an endless loop - Grammar pushed & popped a rule without advancing');
                stack = popped;
                lineTokens.produce(stack, lineLength);
                STOP = true;
                return;
            }
        }
        else {
            let _rule = grammar.getRule(matchedRuleId);
            lineTokens.produce(stack, captureIndices[0].start);
            let beforePush = stack;
            let scopeName = _rule.getName(lineText.content, captureIndices);
            let nameScopesList = stack.contentNameScopesList.push(grammar, scopeName);
            stack = stack.push(matchedRuleId, linePos, anchorPosition, null, nameScopesList, nameScopesList);
            if (_rule instanceof BeginEndRule) {
                let pushedRule = _rule;
                handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
                lineTokens.produce(stack, captureIndices[0].end);
                anchorPosition = captureIndices[0].end;
                let contentName = pushedRule.getContentName(lineText.content, captureIndices);
                let contentNameScopesList = nameScopesList.push(grammar, contentName);
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
            }
            else if (_rule instanceof BeginWhileRule) {
                let pushedRule = _rule;
                handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
                lineTokens.produce(stack, captureIndices[0].end);
                anchorPosition = captureIndices[0].end;
                let contentName = pushedRule.getContentName(lineText.content, captureIndices);
                let contentNameScopesList = nameScopesList.push(grammar, contentName);
                stack = stack.setContentNameScopesList(contentNameScopesList);
                if (pushedRule.whileHasBackReferences) {
                    stack = stack.setEndRule(pushedRule.getWhileWithResolvedBackReferences(lineText.content, captureIndices));
                }
                if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
                    console.error('[3] - Grammar is in an endless loop - Grammar pushed the same rule without advancing');
                    stack = stack.pop();
                    lineTokens.produce(stack, lineLength);
                    STOP = true;
                    return;
                }
            }
            else {
                let matchingRule = _rule;
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

export class StackElementMetadata {
    static toBinaryStr(metadata) {
        let r = metadata.toString(2);
        while (r.length < 32) {
            r = '0' + r;
        }
        return r;
    }
    static printMetadata(metadata) {
        let languageId = StackElementMetadata.getLanguageId(metadata);
        let tokenType = StackElementMetadata.getTokenType(metadata);
        let fontStyle = StackElementMetadata.getFontStyle(metadata);
        let foreground = StackElementMetadata.getForeground(metadata);
        let background = StackElementMetadata.getBackground(metadata);
        console.log({
            languageId: languageId,
            tokenType: tokenType,
            fontStyle: fontStyle,
            foreground: foreground,
            background: background,
        });
    }
    static getLanguageId(metadata) {
        return (metadata & 255) >>> 0;
    }
    static getTokenType(metadata) {
        return (metadata & 1792) >>> 8;
    }
    static getFontStyle(metadata) {
        return (metadata & 14336) >>> 11;
    }
    static getForeground(metadata) {
        return (metadata & 8372224) >>> 14;
    }
    static getBackground(metadata) {
        return (metadata & 4286578688) >>> 23;
    }
    static set(metadata, languageId, tokenType, fontStyle, foreground, background) {
        let _languageId = StackElementMetadata.getLanguageId(metadata);
        let _tokenType = StackElementMetadata.getTokenType(metadata);
        let _fontStyle = StackElementMetadata.getFontStyle(metadata);
        let _foreground = StackElementMetadata.getForeground(metadata);
        let _background = StackElementMetadata.getBackground(metadata);
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
        return ((_languageId << 0)
            | (_tokenType << 8)
            | (_fontStyle << 11)
            | (_foreground << 14)
            | (_background << 23)) >>> 0;
    }
}

export class ScopeListElement {
    constructor(parent, scope, metadata) {
        this.parent = parent;
        this.scope = scope;
        this.metadata = metadata;
    }
    static _equals(a, b) {
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
    equals(other) {
        return ScopeListElement._equals(this, other);
    }
    static _matchesScope(scope, selector, selectorWithDot) {
        return (selector === scope || scope.substring(0, selectorWithDot.length) === selectorWithDot);
    }
    static _matches(target, parentScopes) {
        if (parentScopes === null) {
            return true;
        }
        let len = parentScopes.length;
        let index = 0;
        let selector = parentScopes[index];
        let selectorWithDot = selector + '.';
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
    static mergeMetadata(metadata, scopesList, source) {
        if (source === null) {
            return metadata;
        }
        let fontStyle = -1;
        let foreground = 0;
        let background = 0;
        if (source.themeData !== null) {
            for (let i = 0, len = source.themeData.length; i < len; i++) {
                let themeData = source.themeData[i];
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
    static _push(target, grammar, scopes) {
        for (let i = 0, len = scopes.length; i < len; i++) {
            let scope = scopes[i];
            let rawMetadata = grammar.getMetadataForScope(scope);
            let metadata = ScopeListElement.mergeMetadata(target.metadata, target, rawMetadata);
            target = new ScopeListElement(target, scope, metadata);
        }
        return target;
    }
    push(grammar, scope) {
        if (scope === null) {
            return this;
        }
        if (scope.indexOf(' ') >= 0) {
            return ScopeListElement._push(this, grammar, scope.split(/ /g));
        }
        return ScopeListElement._push(this, grammar, [scope]);
    }
    static _generateScopes(scopesList) {
        let result = [], resultLen = 0;
        while (scopesList) {
            result[resultLen++] = scopesList.scope;
            scopesList = scopesList.parent;
        }
        result.reverse();
        return result;
    }
    generateScopes() {
        return ScopeListElement._generateScopes(this);
    }
}

export class StackElement {
    constructor(parent, ruleId, enterPos, anchorPos, endRule, nameScopesList, contentNameScopesList) {
        this.parent = parent;
        this.depth = (this.parent ? this.parent.depth + 1 : 1);
        this.ruleId = ruleId;
        this._enterPos = enterPos;
        this._anchorPos = anchorPos;
        this.endRule = endRule;
        this.nameScopesList = nameScopesList;
        this.contentNameScopesList = contentNameScopesList;
    }
    static _structuralEquals(a, b) {
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
    static _equals(a, b) {
        if (a === b) {
            return true;
        }
        if (!this._structuralEquals(a, b)) {
            return false;
        }
        return a.contentNameScopesList.equals(b.contentNameScopesList);
    }
    clone() {
        return this;
    }
    equals(other) {
        if (other === null) {
            return false;
        }
        return StackElement._equals(this, other);
    }
    static _reset(el) {
        while (el) {
            el._enterPos = -1;
            el._anchorPos = -1;
            el = el.parent;
        }
    }
    reset() {
        StackElement._reset(this);
    }
    pop() {
        return this.parent;
    }
    safePop() {
        if (this.parent) {
            return this.parent;
        }
        return this;
    }
    push(ruleId, enterPos, anchorPos, endRule, nameScopesList, contentNameScopesList) {
        return new StackElement(this, ruleId, enterPos, anchorPos, endRule, nameScopesList, contentNameScopesList);
    }
    getEnterPos() {
        return this._enterPos;
    }
    getAnchorPos() {
        return this._anchorPos;
    }
    getRule(grammar) {
        return grammar.getRule(this.ruleId);
    }
    _writeString(res, outIndex) {
        if (this.parent) {
            outIndex = this.parent._writeString(res, outIndex);
        }
        res[outIndex++] = `(${this.ruleId}, TODO-${this.nameScopesList}, TODO-${this.contentNameScopesList})`;
        return outIndex;
    }
    toString() {
        let r = [];
        this._writeString(r, 0);
        return '[' + r.join(',') + ']';
    }
    setContentNameScopesList(contentNameScopesList) {
        if (this.contentNameScopesList === contentNameScopesList) {
            return this;
        }
        return this.parent.push(this.ruleId, this._enterPos, this._anchorPos, this.endRule, this.nameScopesList, contentNameScopesList);
    }
    setEndRule(endRule) {
        if (this.endRule === endRule) {
            return this;
        }
        return new StackElement(this.parent, this.ruleId, this._enterPos, this._anchorPos, endRule, this.nameScopesList, this.contentNameScopesList);
    }
    hasSameRuleAs(other) {
        return this.ruleId === other.ruleId;
    }
}

StackElement.NULL = new StackElement(null, 0, 0, 0, null, null, null);

export class LocalStackElement {
    constructor(scopes, endPos) {
        this.scopes = scopes;
        this.endPos = endPos;
    }
}

class LineTokens {
    constructor(emitBinaryTokens, lineText, tokenTypeOverrides) {
        this._emitBinaryTokens = emitBinaryTokens;
        this._tokenTypeOverrides = tokenTypeOverrides;
        if (this._emitBinaryTokens) {
            this._binaryTokens = [];
        }
        else {
            this._tokens = [];
        }
        this._lastTokenEndIndex = 0;
    }
    produce(stack, endIndex) {
        this.produceFromScopes(stack.contentNameScopesList, endIndex);
    }
    produceFromScopes(scopesList, endIndex) {
        if (this._lastTokenEndIndex >= endIndex) {
            return;
        }
        if (this._emitBinaryTokens) {
            let metadata = scopesList.metadata;
            for (const tokenType of this._tokenTypeOverrides) {
                if (tokenType.matcher(scopesList.generateScopes())) {
                    metadata = StackElementMetadata.set(metadata, 0, toTemporaryType(tokenType.type), -1, 0, 0);
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
        let scopes = scopesList.generateScopes();
        this._tokens.push({
            startIndex: this._lastTokenEndIndex,
            endIndex: endIndex,
            scopes: scopes
        });
        this._lastTokenEndIndex = endIndex;
    }
    getResult(stack, lineLength) {
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
    getBinaryResult(stack, lineLength) {
        if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === lineLength - 1) {
            this._binaryTokens.pop();
            this._binaryTokens.pop();
        }
        if (this._binaryTokens.length === 0) {
            this._lastTokenEndIndex = -1;
            this.produce(stack, lineLength);
            this._binaryTokens[this._binaryTokens.length - 2] = 0;
        }
        let result = new Uint32Array(this._binaryTokens.length);
        for (let i = 0, len = this._binaryTokens.length; i < len; i++) {
            result[i] = this._binaryTokens[i];
        }
        return result;
    }
}

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