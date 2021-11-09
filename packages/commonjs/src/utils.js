/* eslint-disable import/prefer-default-export */

import { basename, dirname, extname } from 'path';

import { createFilter, makeLegalIdentifier } from '@rollup/pluginutils';

export function deconflict(scopes, globals, identifier) {
  let i = 1;
  let deconflicted = makeLegalIdentifier(identifier);
  const hasConflicts = () =>
    scopes.some((scope) => scope.contains(deconflicted)) || globals.has(deconflicted);

  while (hasConflicts()) {
    deconflicted = makeLegalIdentifier(`${identifier}_${i}`);
    i += 1;
  }

  for (const scope of scopes) {
    scope.declarations[deconflicted] = true;
  }

  return deconflicted;
}

export function getName(id) {
  const name = makeLegalIdentifier(basename(id, extname(id)));
  if (name !== 'index') {
    return name;
  }
  return makeLegalIdentifier(basename(dirname(id)));
}

export function normalizePathSlashes(path) {
  return path.replace(/\\/g, '/');
}

// TODO Lukas get rid of this?
const VIRTUAL_PATH_BASE = '/$$rollup_base$$';
export const getVirtualPathForDynamicRequirePath = (path, commonDir) => {
  const normalizedPath = normalizePathSlashes(path);
  return normalizedPath.startsWith(commonDir)
    ? VIRTUAL_PATH_BASE + normalizedPath.slice(commonDir.length)
    : normalizedPath;
};

export function capitalize(name) {
  return name[0].toUpperCase() + name.slice(1);
}

export function getStrictRequireSemanticFilter({ strictRequireSemantic }) {
  switch (strictRequireSemantic) {
    case true:
      return { strictRequireSemanticFilter: () => true, detectCycles: false };
    // eslint-disable-next-line no-undefined
    case undefined:
    case 'auto':
    case 'debug':
    case null:
      return { strictRequireSemanticFilter: () => false, detectCycles: true };
    case false:
      return { strictRequireSemanticFilter: () => false, detectCycles: false };
    default:
      if (typeof strictRequireSemantic === 'string' || Array.isArray(strictRequireSemantic)) {
        return {
          strictRequireSemanticFilter: createFilter(strictRequireSemantic),
          detectCycles: false
        };
      }
      throw new Error('Unexpected value for "strictRequireSemantic" option.');
  }
}
