"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
function createFileFromTemplate(pathToTemplate, pathToTarget, variables = {}) {
    const pathToTargetDirectory = path.dirname(pathToTarget);
    // check for the directory
    if (!fs.existsSync(pathToTemplate)) {
        throw new Error(`Unable to find template file '${pathToTemplate}'`);
    }
    // replace variables in the source template file
    let source = fs.readFileSync(pathToTemplate).toString();
    for (const name in variables) {
        const expression = new RegExp(`\\$\{${name}\}`, 'ig');
        source = source.replace(expression, variables[name]);
    }
    // create target file
    fs.mkdirSync(pathToTargetDirectory, { recursive: true });
    fs.writeFileSync(pathToTarget, source);
}
exports.default = createFileFromTemplate;
;
