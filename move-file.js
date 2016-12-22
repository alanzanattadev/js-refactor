import path from 'path';

// Press ctrl+space for code completion
export default function transformer(file, api, options) {
  const j = api.jscodeshift;

  function getCleanPath(p) {
    let pathDetails = path.parse(p);
    let pathNameWithoutExt = path.parse(pathDetails.name).name;
    let pathWithoutExt = `${pathDetails.dir}${pathNameWithoutExt == 'index' ? '' : `/${pathNameWithoutExt}`}`;
    return pathWithoutExt;
  }

  function getTargetPath(filePath, modulePath, external) {
    if (external) {
      return getCleanPath(`${external}${modulePath.substr(1)}`); // 1 = '.'
    } else {
      return getCleanPath(`${path.relative(file.path, modulePath)}`.substr(3)); // 3 = '../'
    }
  }

  function getPathWithoutModule(p, moduleName) {
    return p.substr(2 + (moduleName ? moduleName.length + 3 : 0)); // 3 = '/./'
  }

  return j(file.source)
    .find(j.ImportDeclaration)
    .forEach(importNode => {
      let oldSourcePath = j(importNode).get("source").getValueProperty("value");
      let oldImportString = j(importNode).toSource();
      let targetSourcePath = getTargetPath(file.path, options.fromPath, options.moduleName);
      let oldSourcePathWithoutExt = getCleanPath(oldSourcePath);
      if (oldSourcePathWithoutExt == targetSourcePath) {
        let newSourcePath = path.extname(options.toPath) == '' ?
                              getCleanPath(options.toPath + path.basename(options.fromPath)) :
                              options.toPath;
        let newTargetSourcePath = getTargetPath(file.path, newSourcePath, options.moduleName);
        let newDeclaration = j.importDeclaration(importNode.getValueProperty('specifiers'), j.literal(newTargetSourcePath));
        j(importNode).replaceWith(newDeclaration);
        let newImportString = j(newDeclaration).toSource();
        console.log(`
          =================================================
          Import changed in ${file.path}
            ${oldSourcePath} -> ${newSourcePath}
            ----
            < -> ${oldImportString}
            > => ${newImportString}
            ----
            targetSourcePath: ${targetSourcePath}
            oldSourcePathWithoutExt: ${oldSourcePathWithoutExt}
            newSourcePath: ${newSourcePath}
          =================================================
          `);
      } else {
        console.log(`
          =================================================
          Import not changed in ${file.path}
            ${oldSourcePath}
            ----
            < -> ${oldImportString}
            ----
            targetSourcePath: ${targetSourcePath}
            oldSourcePathWithoutExt: ${oldSourcePathWithoutExt}
          =================================================
          `);
      }
    })
    .toSource();
}
