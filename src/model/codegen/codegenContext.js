import * as tsMorph from "ts-morph";

class CodegenContext {

    processId
    /**
     * @param {ContainerCodegenModel} containerCodegenModel
     */
    containerCodegenModel
    /**
     * @type {Project}
     */
    project = new tsMorph.Project({});

    serviceClass;
    controllerClass;

    /**
     * @type {SourceFile}
     */
    serviceClassFile;
    /**
     * @type {SourceFile}
     */
    controllerClassFile;

    controllerClassImports =[];
    serviceClassImports =[];


    constructor(containerCodegenContext) {
        this.containerCodegenModel = containerCodegenContext;
    }

    addControllerClassImport(defaultImport, moduleSpecifier){
        this.controllerClassImports.push({defaultImport,moduleSpecifier})
    }

    addServiceClassImport(defaultImport, moduleSpecifier){
        this.serviceClassImports.push({defaultImport,moduleSpecifier})
    }

    renderImports() {
        this.controllerClassImports.forEach((entry) => {
            this.controllerClassFile.addImportDeclaration({
                defaultImport: entry.defaultImport,
                moduleSpecifier: entry.moduleSpecifier,
            });
        });
        this.serviceClassImports.forEach((entry) => {
            this.serviceClassFile.addImportDeclaration({
                defaultImport: entry.defaultImport,
                moduleSpecifier: entry.moduleSpecifier,
            });
        });
    }
}

export default CodegenContext;