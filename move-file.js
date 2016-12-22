import {getFullPathInfosDefaults, addOldLocationDetails, addNewLocationDetails} from './pathInfos';

function logChange(infos, changed) {
  console.log(`
    =================================================
    Import ${changed ? '' : 'not'} changed in ${infos.transformedFile.absolutePath}
      ${infos.transformedFile.oldImportDeclaration.rawSourcePath} -> ${infos.transformedFile.newImportDeclaration.cleanSourcePath}
      ----
      < -> ${infos.transformedFile.oldImportDeclaration.source}
      ${changed ? `> => ${infos.transformedFile.newImportDeclaration.source}` : ''}
      ----
      searched source path: ${infos.movedFile.oldLocation.relativeToTransformedPathClean}
      clean source path: ${infos.transformedFile.oldImportDeclaration.cleanSourcePath}
      ${changed ? `new source path: ${infos.transformedFile.newImportDeclaration.cleanSourcePath}` : ''}
    =================================================
  `);
}

export default function transformer(file, api, options) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ImportDeclaration)
    .forEach(importNode => {
      let infos = getFullPathInfosDefaults();
      addOldLocationDetails(infos, j, {
        oldDeclarationNode: importNode,
        transformedFileModuleName: options.currentModuleName,
        filePath: file.path
      }, {
        oldRelativeToCwdMovedFilePath: options.fromPath,
        movedFileModuleName: options.moduleName
      });
      if (infos.transformedFile.oldImportDeclaration.cleanSourcePath == infos.movedFile.oldLocation.relativeToTransformedPathClean) {
        addNewLocationDetails(infos, j, {newRelativeToCwdMovedFilePath: options.toPath});
        j(importNode).replaceWith(infos.transformedFile.newImportDeclaration.node);
        logChange(infos, true);
      } else if (file.path == infos.movedFile.oldLocation.absolutePath) {
        logChange(infos, false);
      } else {
        logChange(infos, false)
      }
    })
    .toSource();
}
