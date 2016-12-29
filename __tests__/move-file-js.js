const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'move-file', {fromPath: "./__testfixtures__/SimpleIntraModuleFile.input.js", toPath: "./__tests__/SimpleIntraModuleFile.output.js", currentModuleName: "veyo-commons"}, 'SimpleIntraModuleFile');
defineTest(__dirname, 'move-file', {fromPath: "./__testfixtures__/SimpleExtraModuleFile.input.js", toPath: "./__tests__/SimpleExtraModuleFile.output.js", moduleName: "veyo-commons"}, 'SimpleExtraModuleFile');
// defineTest(__dirname, 'move-file', {fromPath: "", toPath: "", currentModuleName: ""}, 'ComplexIntraModuleFile');
// defineTest(__dirname, 'move-file', {fromPath: "", toPath: "", moduleName: ""}, 'ComplexExtraModuleFile');
