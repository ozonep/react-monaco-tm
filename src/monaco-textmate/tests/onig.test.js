// 'use strict';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as durations from 'durations';
// import { Resolver } from './resolver';
// import { getOnigasm } from '../onigLibs';
// import { Registry } from '../main';
// describe.skip('Compare OnigLibs outputs', () => {
//     let registrations = getVSCodeRegistrations();
//     ;
//     if (!registrations) {
//         console.log('vscode repo not found, skipping OnigLibs tests');
//         return;
//     }
//     let onigasmResolver = new Resolver(registrations.grammarRegistrations, registrations.languageRegistrations, getOnigasm(), 'onigasm');
//     const fixturesDir = path.join(__dirname, '../../test-cases/onigtests/fixtures');
//     const fixturesFiles = fs.readdirSync(fixturesDir);
//     for (let fixturesFile of fixturesFiles) {
//         let testFilePath = path.join(fixturesDir, fixturesFile);
//         let scopeName = onigasmResolver.findScopeByFilename(fixturesFile);
//         addTest(scopeName, testFilePath, new Registry(onigasmResolver));
//     }
// });
// async function addTest(scopeName, filePath, onigasmRegistry) {
//     it(scopeName + '/' + path.basename(filePath), async () => {
//         const fileContent = fs.readFileSync(filePath).toString();
//         let lines = fileContent.match(/[^\r\n]+/g);
//         let prevState2 = null;
//         let grammar2 = await onigasmRegistry.loadGrammar(scopeName);
//         let stopWatch2 = durations.stopwatch();
//         for (let i = 0; i < lines.length; i++) {
//             let t2 = grammar2.tokenizeLine(lines[i], prevState2);
//             prevState2 = t2.ruleStack;
//         }
//         console.log(`Oniguruma: ${stopWatch1.format()}, Onigasm: ${stopWatch2.format()} (${Math.round(stopWatch2.duration().micros() * 10 / stopWatch1.duration().micros()) / 10}x slower)`);
//     }).timeout(1000000);
// }
// function getVSCodeRegistrations() {
//     const grammarRegistrations = [];
//     const languageRegistrations = [];
//     const extensionsPath = path.join(__dirname, '../../../vscode/extensions');
//     if (!fs.existsSync(extensionsPath)) {
//         return null;
//     }
//     const extDirs = fs.readdirSync(extensionsPath);
//     for (let ext of extDirs) {
//         try {
//             let packageJSONPath = path.join(extensionsPath, ext, 'package.json');
//             if (!fs.existsSync(packageJSONPath)) {
//                 continue;
//             }
//             let packageJSON = JSON.parse(fs.readFileSync(packageJSONPath).toString());
//             let contributes = packageJSON['contributes'];
//             if (contributes) {
//                 let grammars = contributes['grammars'];
//                 if (Array.isArray(grammars)) {
//                     for (let grammar of grammars) {
//                         let registration = {
//                             scopeName: grammar.scopeName,
//                             path: path.join(extensionsPath, ext, grammar.path),
//                             language: grammar.language,
//                             embeddedLanguages: grammar.embeddedLanguages
//                         };
//                         grammarRegistrations.push(registration);
//                     }
//                 }
//                 let languages = contributes['languages'];
//                 if (Array.isArray(languages)) {
//                     for (let language of languages) {
//                         let registration = {
//                             id: language.id,
//                             filenames: language.filenames,
//                             extensions: language.extensions
//                         };
//                         languageRegistrations.push(registration);
//                     }
//                 }
//             }
//         }
//         catch (e) {
//         }
//     }
//     return { grammarRegistrations, languageRegistrations };
// }
