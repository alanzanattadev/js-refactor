
var path = require('path');

function getCleanPath(p) {
  let pathDetails = path.parse(p);
  let pathNameWithoutExt = path.parse(pathDetails.name).name;
  let pathWithoutExt = `${pathDetails.dir}${pathNameWithoutExt == 'index' ? '' : `/${pathNameWithoutExt}`}`;
  return pathWithoutExt;
}

function getRelativePath(p1, p2) {
  let result = `${path.relative(path.parse(p1).dir, p2)}`;
  if (result.startsWith('.'))
    return result;
  else
    return './' + result;
}

function getTargetPath(filePath, modulePath, external) {
  if (external) {
    return getCleanPath(path.join(external, modulePath));
  } else {
    return getCleanPath(getRelativePath(filePath, modulePath));
  }
}

function getAbsolutePathOfRelativeToCwd(p) {
  return path.resolve(process.cwd(), p);
}

function getFullPathInfosDefaults() {
  return {
    transformedFile: {
      oldImportDeclaration: {
        node: null,
        rawSourcePath: null,
        cleanSourcePath: null,
        absolutePath: null,
        source: null
      },
      newImportDeclaration: {
        node: null,
        cleanSourcePath: null,
        rawSourcePath: null,
        absolutePath: null,
        directory: false,
      },
      moduleName: null,
      absolutePath: null,
    },
    movedFile: {
      oldLocation: {
        relativeToCwdPath: null,
        absolutePath: null,
        relativeToPackageRootPath: null,
        relativeToTransformedPath: null,
        relativeToTransformedPathClean: null,
        moduleName: null,
      },
      newLocation: {
        relativeToCwdPath: null,
        absolutePath: null,
        relativeToPackageRootPath: null,
        relativeToTransformedPath: null,
        relativeToTransformedPathClean: null,
        moduleName: null,
        directory: false,
      }
    }
  };
};

function addOldLocationDetails(
  infos,
  j,
  {oldDeclarationNode, transformedFileModuleName, filePath},
  {oldRelativeToCwdMovedFilePath, movedFileModuleName}
) {

  infos.transformedFile.absolutePath = getAbsolutePathOfRelativeToCwd(filePath);
  infos.transformedFile.oldImportDeclaration.node = oldDeclarationNode;
  infos.transformedFile.oldImportDeclaration.rawSourcePath = j(infos.transformedFile.oldImportDeclaration.node).get("source").getValueProperty("value");
  infos.transformedFile.oldImportDeclaration.cleanSourcePath = getCleanPath(infos.transformedFile.oldImportDeclaration.rawSourcePath);
  infos.transformedFile.oldImportDeclaration.absolutePath = path.resolve(path.dirname(infos.transformedFile.absolutePath), infos.transformedFile.oldImportDeclaration.cleanSourcePath);
  infos.transformedFile.oldImportDeclaration.source = j(infos.transformedFile.oldImportDeclaration.node).toSource();
  infos.transformedFile.moduleName = transformedFileModuleName;

  infos.movedFile.oldLocation.relativeToCwdPath = oldRelativeToCwdMovedFilePath;
  infos.movedFile.oldLocation.absolutePath = getAbsolutePathOfRelativeToCwd(infos.movedFile.oldLocation.relativeToCwdPath);
  infos.movedFile.oldLocation.relativeToPackageRootPath = null;
  infos.movedFile.oldLocation.relativeToTransformedPath = null;
  infos.movedFile.oldLocation.relativeToTransformedPathClean = getTargetPath(filePath, infos.movedFile.oldLocation.relativeToCwdPath, movedFileModuleName);
  infos.movedFile.oldLocation.moduleName = movedFileModuleName;

}

function addNewLocationDetails(infos, j, {newRelativeToCwdMovedFilePath}) {

  infos.movedFile.newLocation.directory = path.extname(newRelativeToCwdMovedFilePath) == '';
  infos.movedFile.newLocation.relativeToCwdPath = path.join(newRelativeToCwdMovedFilePath, (infos.movedFile.newLocation.directory ? path.basename(infos.movedFile.oldLocation.relativeToCwdPath) : ''));
  infos.movedFile.newLocation.absolutePath = getAbsolutePathOfRelativeToCwd(infos.movedFile.newLocation.relativeToCwdPath);
  infos.movedFile.newLocation.relativeToPackageRootPath = null;
  infos.movedFile.newLocation.relativeToTransformedPath = null;
  infos.movedFile.newLocation.relativeToTransformedPathClean = getTargetPath(infos.transformedFile.absolutePath,
                                                                              infos.movedFile.oldLocation.moduleName ?
                                                                                infos.movedFile.newLocation.relativeToCwdPath :
                                                                                infos.movedFile.newLocation.absolutePath,
                                                                              infos.movedFile.oldLocation.moduleName);
  infos.movedFile.newLocation.moduleName = infos.movedFile.oldLocation.moduleName;

  infos.transformedFile.newImportDeclaration.directory = infos.movedFile.newLocation.directory;
  infos.transformedFile.newImportDeclaration.rawSourcePath = null;
  infos.transformedFile.newImportDeclaration.cleanSourcePath = infos.movedFile.newLocation.relativeToTransformedPathClean;
  infos.transformedFile.newImportDeclaration.node = j.importDeclaration(infos.transformedFile.oldImportDeclaration.node.getValueProperty('specifiers'),
                                                                          j.literal(infos.transformedFile.newImportDeclaration.cleanSourcePath));
  infos.transformedFile.newImportDeclaration.source = j(infos.transformedFile.newImportDeclaration.node).toSource();

}

function addNewLocationDetailsOfImport(infos, j, {newRelativeToCwdMovedFilePath}) {
  infos.movedFile.newLocation.directory = path.extname(newRelativeToCwdMovedFilePath) == '';
  infos.movedFile.newLocation.relativeToCwdPath = newRelativeToCwdMovedFilePath + (infos.movedFile.newLocation.directory ? path.basename(infos.movedFile.oldLocation.relativeToCwdPath) : '');
  infos.movedFile.newLocation.absolutePath = getAbsolutePathOfRelativeToCwd(infos.movedFile.newLocation.relativeToCwdPath);
  infos.movedFile.newLocation.relativeToPackageRootPath = null;
  infos.movedFile.newLocation.relativeToTransformedPath = null;
  infos.movedFile.newLocation.relativeToTransformedPathClean = getTargetPath(infos.transformedFile.absolutePath,
                                                                              infos.movedFile.oldLocation.moduleName ?
                                                                                infos.movedFile.newLocation.relativeToCwdPath :
                                                                                infos.movedFile.newLocation.absolutePath,
                                                                              infos.movedFile.oldLocation.moduleName);
  infos.movedFile.newLocation.moduleName = infos.movedFile.oldLocation.moduleName;

  infos.transformedFile.newImportDeclaration.directory = false;
  infos.transformedFile.newImportDeclaration.rawSourcePath = null;
  infos.transformedFile.newImportDeclaration.cleanSourcePath =
    getTargetPath(
      infos.movedFile.newLocation.absolutePath,
      infos.transformedFile.oldImportDeclaration.absolutePath,
      null
    );
  infos.transformedFile.newImportDeclaration.node = j.importDeclaration(infos.transformedFile.oldImportDeclaration.node.getValueProperty('specifiers'),
                                                                          j.literal(infos.transformedFile.newImportDeclaration.cleanSourcePath));
  infos.transformedFile.newImportDeclaration.source = j(infos.transformedFile.newImportDeclaration.node).toSource();
}

module.exports = {
  getCleanPath,
  getRelativePath,
  getTargetPath,
  getAbsolutePathOfRelativeToCwd,
  getFullPathInfosDefaults,
  addOldLocationDetails,
  addNewLocationDetails,
  addNewLocationDetailsOfImport,
};
