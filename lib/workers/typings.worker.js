'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _idbKeyval = require('idb-keyval');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable */
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/typescript/2.9.2/typescript.min.js');

var ROOT_URL = 'https://cdn.jsdelivr.net/';

var store = new _idbKeyval.Store('typescript-definitions-cache-v1');
var fetchCache = new Map();

var doFetch = function doFetch(url) {
  var cached = fetchCache.get(url);

  if (cached) {
    return cached;
  }

  var promise = fetch(url).then(function (response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    }

    var error = new Error(response.statusText || response.status);

    return Promise.reject(error);
  }).then(function (response) {
    return response.text();
  });

  fetchCache.set(url, promise);

  return promise;
};

var fetchFromDefinitelyTyped = function fetchFromDefinitelyTyped(dependency, version, fetchedPaths) {
  return doFetch(ROOT_URL + 'npm/@types/' + dependency.replace('@', '').replace(/\//g, '__') + '/index.d.ts').then(function (typings) {
    fetchedPaths['node_modules/' + dependency + '/index.d.ts'] = typings;
  });
};

var getRequireStatements = function getRequireStatements(title, code) {
  var requires = [];

  var sourceFile = self.ts.createSourceFile(title, code, self.ts.ScriptTarget.Latest, true, self.ts.ScriptKind.TS);

  self.ts.forEachChild(sourceFile, function (node) {
    switch (node.kind) {
      case self.ts.SyntaxKind.ImportDeclaration:
        {
          requires.push(node.moduleSpecifier.text);
          break;
        }
      case self.ts.SyntaxKind.ExportDeclaration:
        {
          // For syntax 'export ... from '...'''
          if (node.moduleSpecifier) {
            requires.push(node.moduleSpecifier.text);
          }
          break;
        }
      default:
        {
          /* */
        }
    }
  });

  return requires;
};

var tempTransformFiles = function tempTransformFiles(files) {
  var finalObj = {};

  files.forEach(function (d) {
    finalObj[d.name] = d;
  });

  return finalObj;
};

var getFileMetaData = function getFileMetaData(dependency, version, depPath) {
  return doFetch('https://data.jsdelivr.com/v1/package/npm/' + dependency + '@' + version + '/flat').then(function (response) {
    return JSON.parse(response);
  }).then(function (response) {
    return response.files.filter(function (f) {
      return f.name.startsWith(depPath);
    });
  }).then(tempTransformFiles);
};

var resolveAppropiateFile = function resolveAppropiateFile(fileMetaData, relativePath) {
  var absolutePath = '/' + relativePath;

  if (fileMetaData[absolutePath + '.d.ts']) return relativePath + '.d.ts';
  if (fileMetaData[absolutePath + '.ts']) return relativePath + '.ts';
  if (fileMetaData[absolutePath]) return relativePath;
  if (fileMetaData[absolutePath + '/index.d.ts']) return relativePath + '/index.d.ts';

  return relativePath;
};

var getFileTypes = function getFileTypes(depUrl, dependency, depPath, fetchedPaths, fileMetaData) {
  var virtualPath = _path2.default.join('node_modules', dependency, depPath);

  if (fetchedPaths[virtualPath]) return null;

  return doFetch(depUrl + '/' + depPath).then(function (typings) {
    if (fetchedPaths[virtualPath]) return null;

    fetchedPaths[virtualPath] = typings;

    // Now find all require statements, so we can download those types too
    return Promise.all(getRequireStatements(depPath, typings).filter(
    // Don't add global deps
    function (dep) {
      return dep.startsWith('.');
    }).map(function (relativePath) {
      return _path2.default.join(_path2.default.dirname(depPath), relativePath);
    }).map(function (relativePath) {
      return resolveAppropiateFile(fileMetaData, relativePath);
    }).map(function (nextDepPath) {
      return getFileTypes(depUrl, dependency, nextDepPath, fetchedPaths, fileMetaData);
    }));
  });
};

function fetchFromMeta(dependency, version, fetchedPaths) {
  var depUrl = 'https://data.jsdelivr.com/v1/package/npm/' + dependency + '@' + version + '/flat';

  return doFetch(depUrl).then(function (response) {
    return JSON.parse(response);
  }).then(function (meta) {
    var filterAndFlatten = function filterAndFlatten(files, filter) {
      return files.reduce(function (paths, file) {
        if (filter.test(file.name)) {
          paths.push(file.name);
        }
        return paths;
      }, []);
    };

    var dtsFiles = filterAndFlatten(meta.files, /\.d\.ts$/);
    if (dtsFiles.length === 0) {
      // if no .d.ts files found, fallback to .ts files
      dtsFiles = filterAndFlatten(meta.files, /\.ts$/);
    }

    if (dtsFiles.length === 0) {
      throw new Error('No inline typings found for ' + dependency + '@' + version);
    }

    dtsFiles.forEach(function (file) {
      doFetch('https://cdn.jsdelivr.net/npm/' + dependency + '@' + version + file).then(function (dtsFile) {
        fetchedPaths['node_modules/' + dependency + file] = dtsFile;
      }).catch(function () {});
    });
  });
}

function fetchFromTypings(dependency, version, fetchedPaths) {
  var depUrl = ROOT_URL + 'npm/' + dependency + '@' + version;

  return doFetch(depUrl + '/package.json').then(function (response) {
    return JSON.parse(response);
  }).then(function (packageJSON) {
    var types = packageJSON.typings || packageJSON.types;
    if (types) {
      // Add package.json, since this defines where all types lie
      fetchedPaths['node_modules/' + dependency + '/package.json'] = JSON.stringify(packageJSON);

      // get all files in the specified directory
      return getFileMetaData(dependency, version, _path2.default.join('/', _path2.default.dirname(types))).then(function (fileData) {
        return getFileTypes(depUrl, dependency, resolveAppropiateFile(fileData, types), fetchedPaths, fileData);
      });
    }

    throw new Error('No typings field in package.json for ' + dependency + '@' + version);
  });
}

function fetchDefinitions(name, version) {
  if (!version) {
    return Promise.reject(new Error('No version specified for ' + name));
  }

  // Query cache for the defintions
  var key = name + '@' + version;

  return (0, _idbKeyval.get)(key, store).catch(function (e) {
    console.error('An error occurred when getting definitions from cache', e);
  }).then(function (result) {
    if (result) {
      return result;
    }

    // If result is empty, fetch from remote
    var fetchedPaths = {};

    return fetchFromTypings(name, version, fetchedPaths).catch(function () {
      return (
        // not available in package.json, try checking meta for inline .d.ts files
        fetchFromMeta(name, version, fetchedPaths)
      );
    }).catch(function () {
      return (
        // Not available in package.json or inline from meta, try checking in @types/
        fetchFromDefinitelyTyped(name, version, fetchedPaths)
      );
    }).then(function () {
      if (Object.keys(fetchedPaths).length) {
        // Also cache the definitions
        (0, _idbKeyval.set)(key, fetchedPaths, store);

        return fetchedPaths;
      } else {
        throw new Error('Type definitions are empty for ' + key);
      }
    });
  });
}

self.addEventListener('message', function (event) {
  var _event$data = event.data,
      name = _event$data.name,
      version = _event$data.version;


  fetchDefinitions(name, version).then(function (result) {
    return self.postMessage({
      name: name,
      version: version,
      typings: result
    });
  }, function (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  });
});