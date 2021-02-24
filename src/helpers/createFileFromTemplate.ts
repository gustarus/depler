import * as path from 'path';
import * as fs from 'fs-extra';
import { type } from 'os';

type LoopsTree = { [key: string]: LoopsTree | { [key: string]: string } };
type Variables = { [key: string]: boolean | string | Variables[] };
type Block = { key: string; open: number; close: number; content: string };
type Process = (block: Block) => string[];

const expressionLoop = /<%\s*\/?LOOP[^%]+%>/ig; // use "g" scope to search for all needles
const expressionLoopOpen = /<%\s*LOOP\s+\${\s*([\w._\-]+)\s*}\s*%>/i;
const expressionLoopClose = /<%\s*\/LOOP\s*%>/i;

const expressionIf = /<%\s*\/?IF[^%]+%>/ig; // use "g" scope to search for all needles
const expressionIfOpen = /<%\s*IF\s+\${\s*([\w._\-]+)\s*}\s*%>/i;
const expressionIfClose = /<%\s*\/IF\s*%>/i;

function extractBlocks(template: string, expressionSome: RegExp, expressionOpen: RegExp, expressionClose: RegExp): Block[] {
  // detect for loops to replace them later
  const blocks: Block[] = [];
  const matches = [...template.matchAll(expressionSome)];
  if (matches && matches.length) {
    let level = 0;
    let key = undefined;
    let indexOpen = undefined;
    let indexClose = undefined;
    let indexContentOpen = undefined;
    let indexContentClose = undefined;

    // calculate for loops positions
    for (const match of matches) {
      const matchesOpen = match[0].match(expressionOpen);
      const matchesClose = match[0].match(expressionClose);

      if (matchesOpen && match.index) {
        if (level === 0) {
          key = matchesOpen[1];
          indexOpen = match.index;
          indexContentOpen = match.index + match[0].length;
        }

        level++;
      } else if (matchesClose && match.index) {
        level--;

        if (level === 0) {
          indexContentClose = match.index;
          indexClose = match.index + match[0].length;
        }

        if (level === -1) {
          throw new Error('Too many close loops tags found');
        }
      } else {
        throw new Error('Unknown artifact found while searching for loops');
      }

      if (key !== undefined
        && indexOpen !== undefined && indexClose !== undefined
        && indexContentOpen !== undefined && indexContentClose !== undefined
      ) {
        const content = template.slice(indexContentOpen, indexContentClose);
        blocks.push({ key, open: indexOpen, close: indexClose, content });
        key = undefined;
        indexOpen = undefined;
        indexClose = undefined;
        indexContentOpen = undefined;
        indexContentClose = undefined;
      }
    }
  }

  return blocks;
}

function processBlocks(template: string, blocks: Block[], callback: Process): string {
  // process loops
  // and build the template without loops
  const parts = blocks.length
    ? [template.slice(0, blocks[0].open)] : [template];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const collection = callback(block);
    parts.push(...collection);

    // push tail after the loop to the parts collection
    const next = blocks[i + 1];
    parts.push(template.slice(block.close, next && next.open));
  }

  // build the final template
  return parts.join('');
}

function processTemplate(template: string, variables: Variables, context: Variables) {
  let result = template;

  // process and replace all loop blocks
  const loops = extractBlocks(template, expressionLoop, expressionLoopOpen, expressionLoopClose);
  result = processBlocks(result, loops, (block) => {
    const value = context[block.key] || [];
    if (!Array.isArray(value)) {
      throw new Error(`Invalid variable "${block.key}" format passed: should be an array to use for the loop`);
    }

    // iterate through loop values and create new parts
    return value.map((item) => processTemplate(block.content, variables, item));
  });

  // process and replace all if blocks
  const conditions = extractBlocks(template, expressionIf, expressionIfOpen, expressionIfClose);
  result = processBlocks(result, conditions, (block) => {
    const value = block.key.includes('ITEM.')
      ? context[block.key.replace('ITEM.', '')]
      : variables[block.key];
    if (typeof value !== 'boolean') {
      throw new Error(`Invalid variable "${block.key}" type passed: only boolean values supported for conditionals`);
    }

    // iterate through loop values and create new parts
    return value ? [block.content] : [];
  });

  // replace item usages if present from the context
  const properties = [...result.matchAll(/\${ITEM\.([\w-_]+)}/ig)].map((match) => match[1]);
  const propertiesObject = properties.reduce((stack: any, name: string) => (stack[name] = true) && stack, {});
  for (const property of Object.keys(propertiesObject)) {
    if (typeof context[property] === 'undefined') {
      throw new Error(`There is no required property "${property}" defined in the loop item scope`);
    }

    const expression = new RegExp(`\\$\{ITEM\.${property}\}`, 'ig');
    result = result.replace(expression, context[property].toString());
  }

  // replace global variables from the variables collection
  const globals = [...result.matchAll(/\${([\w-_]+)}/ig)].map((match) => match[1]);
  const globalsObject = globals.reduce((stack: any, name: string) => (stack[name] = true) && stack, {});
  for (const global of Object.keys(globalsObject)) {
    if (typeof variables[global] === 'undefined') {
      throw new Error(`There is no required global variable "${global}" defined in the variables scope`);
    }

    const expression = new RegExp(`\\$\{${global}\}`, 'ig');
    result = result.replace(expression, variables[global].toString());
  }

  return result;
}

export default function createFileFromTemplate(pathToTemplate: string, pathToTarget: string, variables: Variables = {}): void {
  const pathToTargetDirectory = path.dirname(pathToTarget);

  // check for the directory
  if (!fs.existsSync(pathToTemplate)) {
    throw new Error(`Unable to find template file '${pathToTemplate}'`);
  }

  // read the template contents and replace variables
  const source = fs.readFileSync(pathToTemplate).toString();
  const compiled = processTemplate(source, variables, variables);
  const prettified = compiled
    .replace(/\n\s+\n/, '\n\n')
    .replace(/\n\s*\n\s*\n/, '\n\n')
    .replace(/(}\s*)\n\s*\n(\s*})/, '$1\n$2');

  // create target file
  fs.mkdirSync(pathToTargetDirectory, { recursive: true });
  fs.writeFileSync(pathToTarget, prettified);
};
