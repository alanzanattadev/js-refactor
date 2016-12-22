
import path from 'path';

export function getCleanPath(p) {
  let pathDetails = path.parse(p);
  let pathNameWithoutExt = path.parse(pathDetails.name).name;
  let pathWithoutExt = `${pathDetails.dir}${pathNameWithoutExt == 'index' ? '' : `/${pathNameWithoutExt}`}`;
  return pathWithoutExt;
}

export function getRelativePath(p1, p2) {
  return `${path.relative(p1, p2)}`.substr(3); // 3 = '../'
}

export function getTargetPath(filePath, modulePath, external) {
  if (external) {
    return getCleanPath(`${external}${modulePath.substr(1)}`); // 1 = '.'
  } else {
    return getCleanPath(getRelativePath(filePath, modulePath));
  }
}

export function getPathWithoutModule(p, moduleName) {
  return p.substr(2 + (moduleName ? moduleName.length + 3 : 0)); // 3 = '/./'
}

export function getAbsolutePathOfRelativeToCwd(p: string) {
  return path.resolve(process.cwd(), p);
}

export function getFullPathInfosDefaults() {
  return {
    transformedFile: {
      oldImportDeclaration: {
        node: null,
        rawSourcePath: null,
        cleanSourcePath: null,
        source: null
      },
      newImportDeclaration: {
        node: null,
        cleanSourcePath: null,
        rawSourcePath: null,
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

export function addOldLocationDetails(
  infos,
  j,
  {oldDeclarationNode, transformedFileModuleName, filePath},
  {oldRelativeToCwdMovedFilePath, movedFileModuleName}
) {

  infos.transformedFile.oldImportDeclaration.node = oldDeclarationNode;
  infos.transformedFile.oldImportDeclaration.rawSourcePath = j(infos.transformedFile.oldImportDeclaration.node).get("source").getValueProperty("value");
  infos.transformedFile.oldImportDeclaration.cleanSourcePath = getCleanPath(infos.transformedFile.oldImportDeclaration.rawSourcePath);
  infos.transformedFile.oldImportDeclaration.source = j(infos.transformedFile.oldImportDeclaration.node).toSource();
  infos.transformedFile.moduleName = transformedFileModuleName;
  infos.transformedFile.absolutePath = filePath;

  infos.movedFile.oldLocation.relativeToCwdPath = oldRelativeToCwdMovedFilePath;
  infos.movedFile.oldLocation.absolutePath = getAbsolutePathOfRelativeToCwd(infos.movedFile.oldLocation.relativeToCwdPath);
  infos.movedFile.oldLocation.relativeToPackageRootPath = null;
  infos.movedFile.oldLocation.relativeToTransformedPath = null;
  infos.movedFile.oldLocation.relativeToTransformedPathClean = getTargetPath(filePath, infos.movedFile.oldLocation.relativeToCwdPath, movedFileModuleName);
  infos.movedFile.oldLocation.moduleName = movedFileModuleName;

}

export function addNewLocationDetails(infos, j, {newRelativeToCwdMovedFilePath}) {

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

  infos.transformedFile.newImportDeclaration.directory = infos.movedFile.newLocation.directory;
  infos.transformedFile.newImportDeclaration.rawSourcePath = null;
  infos.transformedFile.newImportDeclaration.cleanSourcePath = infos.movedFile.newLocation.relativeToTransformedPathClean;
  infos.transformedFile.newImportDeclaration.node = j.importDeclaration(infos.transformedFile.oldImportDeclaration.node.getValueProperty('specifiers'),
                                                                          j.literal(infos.transformedFile.newImportDeclaration.cleanSourcePath));
  infos.transformedFile.newImportDeclaration.source = j(infos.transformedFile.newImportDeclaration.node).toSource();

}
