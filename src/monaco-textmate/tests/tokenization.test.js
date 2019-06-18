// 'use strict';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as assert from 'assert';
// import { Registry, parseJSONGrammar } from '../main';
// import { getOnigasm } from '../onigLibs';
// const REPO_ROOT = path.join(__dirname, '../../');
// function assertTokenizationSuite(testLocation) {
//     let tests = JSON.parse(fs.readFileSync(testLocation).toString());
//     tests.forEach((test) => {
//             it(test.desc + '-onigasm', () => {
//                 return performTest(test, getOnigasm());
//             });
//     });
//     async function performTest(test, onigLib) {
//         let grammarScopeName = test.grammarScopeName;
//         let grammarByScope = {};
//         for (let grammarPath of test.grammars) {
//             let content = fs.readFileSync(path.join(path.dirname(testLocation), grammarPath)).toString();
//             let rawGrammar = parseJSONGrammar(content, grammarPath);
//             grammarByScope[rawGrammar.scopeName] = rawGrammar;
//             if (!grammarScopeName && grammarPath === test.grammarPath) {
//                 grammarScopeName = rawGrammar.scopeName;
//             }
//         }
//         ;
//         let locator = {
//             loadGrammar: (scopeName) => Promise.resolve(grammarByScope[scopeName]),
//             getInjections: (scopeName) => {
//                 if (scopeName === grammarScopeName) {
//                     return test.grammarInjections;
//                 }
//             },
//             getOnigLib: () => onigLib
//         };
//         let registry = new Registry(locator);
//         let grammar = await registry.loadGrammar(grammarScopeName);
//         if (!grammar) {
//             throw new Error('I HAVE NO GRAMMAR FOR TEST');
//         }
//         let prevState = null;
//         for (let i = 0; i < test.lines.length; i++) {
//             prevState = assertLineTokenization(grammar, test.lines[i], prevState);
//         }
//     }
//     function assertLineTokenization(grammar, testCase, prevState) {
//         let actual = grammar.tokenizeLine(testCase.line, prevState);
//         let actualTokens = actual.tokens.map((token) => {
//             return {
//                 value: testCase.line.substring(token.startIndex, token.endIndex),
//                 scopes: token.scopes
//             };
//         });
//         if (testCase.line.length > 0) {
//             testCase.tokens = testCase.tokens.filter((token) => {
//                 return (token.value.length > 0);
//             });
//         }
//         assert.deepStrictEqual(actualTokens, testCase.tokens, 'Tokenizing line ' + testCase.line);
//         return actual.ruleStack;
//     }
// }
// describe('Tokenization /first-mate/', () => {
//     assertTokenizationSuite(path.join(REPO_ROOT, 'test-cases/first-mate/tests.json'));
// });
// describe('Tokenization /suite1/', () => {
//     assertTokenizationSuite(path.join(REPO_ROOT, 'test-cases/suite1/tests.json'));
//     assertTokenizationSuite(path.join(REPO_ROOT, 'test-cases/suite1/whileTests.json'));
// });
