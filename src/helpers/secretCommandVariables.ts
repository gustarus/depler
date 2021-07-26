import { SECRET_MASK } from '../constants';

const quoteExpressionTemplate = '\\\\?\\\\?[\'"]';
const quoteExpression = new RegExp(quoteExpressionTemplate, 'ig');

const secretVariablesExpressions = [
  // match strings like "-p"
  /\s+-p\s*/ig,

  // match strings like "--password="
  /\s+(--password|--secret|--key)\s*=\s*/ig,

  // match strings like "--build-arg SOME_VARIABLE="
  /\s+(--build-arg|-e|--env)\s+[a-z-_]+\s*=\s*/ig,
];

function getQuoteSymbol(value: string, position: number): string | undefined {
  const child = value.substring(position);
  const match = quoteExpression.exec(child);
  return match && match.index === 0
    ? match[0] : undefined;
}

function replaceSecrets(value: string, expression: RegExp, match: string[]) {
  let masked = value;

  const definition = match[0];
  const quoteSymbol = getQuoteSymbol(value, expression.lastIndex);
  if (quoteSymbol) {
    // replace '--build-arg SOME_VARIABLE="secret with spaces"'
    // or "--build-arg SOME_VARIABLE='secret with spaces'" strings
    // or "--password='secret with spaces'" strings
    const replaceRegex = new RegExp(`${definition}${quoteExpressionTemplate}(.*?)${quoteExpressionTemplate}`, 'ig');
    const replaceReplacement = `${definition}${quoteSymbol}${SECRET_MASK}${quoteSymbol}`;
    masked = masked.replace(replaceRegex, replaceReplacement);
  } else {
    // replace '--build-arg SOME_VARIABLE=secret' strings
    // or "--password=secret" strings
    const replaceRegex = new RegExp(`${definition}[^\\s]+`, 'ig');
    const replaceReplacement = `${definition}${SECRET_MASK}`;
    masked = masked.replace(replaceRegex, replaceReplacement);
  }

  return masked;
}

export default function secretCommandVariables(cmd: string): string {
  let masked = cmd;

  let match;
  for (const expression of secretVariablesExpressions) {
    while ((match = expression.exec(cmd)) !== null) {
      masked = replaceSecrets(cmd, expression, match);
    }
  }

  return masked;
};
