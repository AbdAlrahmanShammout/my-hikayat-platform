import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const AUDIENCES = ['admin', 'author', 'reader'];

const apiBaseUrl = (process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');
const outputDirectory = path.join(FRONTEND_ROOT, 'src', 'generated');

await mkdir(outputDirectory, { recursive: true });

for (const audience of AUDIENCES) {
  const documentUrl = `${apiBaseUrl}/docs/${audience}-json`;
  const document = await fetchOpenApiDocument(documentUrl);
  const source = buildTypeScriptSource(document, documentUrl);
  await writeFile(path.join(outputDirectory, `${audience}.ts`), source);
  process.stdout.write(`Wrote src/generated/${audience}.ts from ${documentUrl}\n`);
}

async function fetchOpenApiDocument(documentUrl) {
  const response = await fetch(documentUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${documentUrl} (${response.status}). Start the API so the audience OpenAPI JSON is reachable.`,
    );
  }
  return response.json();
}

function buildTypeScriptSource(document, documentUrl) {
  const banner = [
    '/**',
    ` * Generated from ${documentUrl}. Do not edit by hand.`,
    ' * Regenerate with: pnpm --filter frontend generate:api',
    ' */',
    '',
    'export interface paths {',
    ...buildPathLines(document.paths ?? {}),
    '}',
    '',
    'export interface components {',
    '  schemas: {',
    ...buildSchemaLines(document.components?.schemas ?? {}),
    '  };',
    '}',
    '',
  ];
  return banner.join('\n');
}

function buildPathLines(paths) {
  const lines = [];
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    lines.push(`  ${quote(pathKey)}: {`);
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const operation = pathItem[method];
      if (operation === undefined) {
        continue;
      }
      lines.push(`    ${method}: {`);
      lines.push(...indent(buildOperationLines(operation), 6));
      lines.push('    };');
    }
    lines.push('  };');
  }
  return lines;
}

function buildOperationLines(operation) {
  const lines = [];
  const parametersType = buildParametersType(operation.parameters ?? []);
  if (parametersType !== undefined) {
    lines.push(`parameters: ${parametersType};`);
  }
  const requestBodyLine = buildRequestBodyType(operation.requestBody);
  if (requestBodyLine !== undefined) {
    lines.push(requestBodyLine);
  }
  lines.push('responses: {');
  lines.push(...indent(buildResponseLines(operation.responses ?? {}), 2));
  lines.push('};');
  return lines;
}

function buildParametersType(parameters) {
  const query = {};
  const pathParams = {};
  for (const parameter of parameters) {
    const target = parameter.in === 'path' ? pathParams : parameter.in === 'query' ? query : null;
    if (target === null) {
      continue;
    }
    const optional = parameter.required === true ? '' : '?';
    target[`${parameter.name}${optional}`] = renderSchema(parameter.schema ?? {});
  }
  if (Object.keys(query).length === 0 && Object.keys(pathParams).length === 0) {
    return undefined;
  }
  const parts = [];
  if (Object.keys(query).length > 0) {
    parts.push(`query?: ${renderObjectType(query)}`);
  }
  if (Object.keys(pathParams).length > 0) {
    parts.push(`path: ${renderObjectType(pathParams)}`);
  }
  return `{ ${parts.join('; ')} }`;
}

function buildRequestBodyType(requestBody) {
  if (requestBody === undefined) {
    return undefined;
  }
  const jsonSchema = requestBody.content?.['application/json']?.schema;
  if (jsonSchema === undefined) {
    return undefined;
  }
  const type = `{ content: { 'application/json': ${renderSchema(jsonSchema)} } }`;
  if (requestBody.required === true) {
    return `requestBody: ${type};`;
  }
  return `requestBody?: ${type};`;
}

function buildResponseLines(responses) {
  const lines = [];
  for (const [status, response] of Object.entries(responses)) {
    const jsonSchema = response.content?.['application/json']?.schema;
    if (jsonSchema === undefined) {
      lines.push(`${quote(status)}: { content?: never };`);
      continue;
    }
    lines.push(`${quote(status)}: { content: { 'application/json': ${renderSchema(jsonSchema)} } };`);
  }
  return lines;
}

function buildSchemaLines(schemas) {
  const lines = [];
  for (const [name, schema] of Object.entries(schemas)) {
    lines.push(`    ${name}: ${renderSchema(schema)};`);
  }
  return lines;
}

function renderSchema(schema) {
  if (schema === undefined || schema === null) {
    return 'unknown';
  }
  if (typeof schema.$ref === 'string') {
    return renderRef(schema.$ref);
  }
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    const union = schema.enum.map((value) => JSON.stringify(value)).join(' | ');
    return schema.nullable === true ? `${union} | null` : union;
  }
  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    const combined = schema.allOf.map((part) => renderSchema(part)).join(' & ');
    return schema.nullable === true ? `(${combined}) | null` : combined;
  }
  if (schema.type === 'array') {
    const items = renderSchema(schema.items ?? {});
    return schema.nullable === true ? `Array<${items}> | null` : `Array<${items}>`;
  }
  if (schema.type === 'object' || schema.properties !== undefined) {
    const objectType = renderObjectFromSchema(schema);
    return schema.nullable === true ? `${objectType} | null` : objectType;
  }
  const primitive = renderPrimitive(schema.type);
  return schema.nullable === true ? `${primitive} | null` : primitive;
}

function renderObjectFromSchema(schema) {
  const properties = schema.properties ?? {};
  const names = Object.keys(properties);
  if (names.length === 0) {
    return 'unknown';
  }
  const required = new Set(schema.required ?? []);
  const fields = {};
  for (const name of names) {
    const optional = required.has(name) ? '' : '?';
    fields[`${name}${optional}`] = renderSchema(properties[name]);
  }
  return renderObjectType(fields);
}

function renderObjectType(fields) {
  const entries = Object.entries(fields).map(([key, type]) => `${quoteIfNeeded(key)}: ${type}`);
  return `{ ${entries.join('; ')} }`;
}

function renderRef(ref) {
  const prefix = '#/components/schemas/';
  if (!ref.startsWith(prefix)) {
    return 'unknown';
  }
  return `components['schemas']['${ref.slice(prefix.length)}']`;
}

function renderPrimitive(type) {
  if (type === 'string') {
    return 'string';
  }
  if (type === 'number' || type === 'integer') {
    return 'number';
  }
  if (type === 'boolean') {
    return 'boolean';
  }
  return 'unknown';
}

function quote(value) {
  return JSON.stringify(value);
}

function quoteIfNeeded(key) {
  if (key.endsWith('?')) {
    const name = key.slice(0, -1);
    return isIdentifier(name) ? `${name}?` : `${quote(name)}?`;
  }
  return isIdentifier(key) ? key : quote(key);
}

function isIdentifier(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function indent(lines, spaces) {
  const pad = ' '.repeat(spaces);
  return lines.map((line) => `${pad}${line}`);
}
