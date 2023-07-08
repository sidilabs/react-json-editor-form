/* eslint-disable @typescript-eslint/no-explicit-any */
export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
}

export const typeMap: Record<DataType, any> = {
  [DataType.STRING]: '',
  [DataType.BOOLEAN]: true,
  [DataType.NUMBER]: 0,
  [DataType.OBJECT]: {},
  [DataType.ARRAY]: [],
};

export const getTypeString = (element: any): string => {
  return Object.prototype.toString.call(element).match(/\w+/g)?.[1].toLowerCase() as string;
};

const setNewValue: any = (keys: string[], obj: any, newElement: any, isChangingKey = false, result: any[] = []) => {
  const index: any = keys.shift();
  const objKeys: string[] = Object.keys(obj);
  if (keys.length) {
    return setNewValue(keys, obj[objKeys[index]], newElement, isChangingKey);
  }
  if (isChangingKey) {
    delete obj[objKeys[index]];
    result[0] = { ...obj, ...newElement };
  } else {
    obj[objKeys[index]] = newElement;
  }
};
// #TODO this function has logical issues
export const getQuoteAddress = (
  newElement: any,
  uniqueKey: string,
  currentData: {
    [keyof: string]: any;
  },
  isChangingKey = false,
) => {
  // because first index is root index, don't find it.
  const indexKeys = uniqueKey.split('-').slice(1);
  setNewValue(indexKeys, currentData, newElement, isChangingKey);
  return currentData;
};

export const isObject = (value: any) => {
  return !!(value && typeof value === 'object');
};

export const getPlaceholder = (value: any) => {
  if (!isObject(value)) return null;
  const currentType = getTypeString(value);
  if (currentType === DataType.ARRAY) {
    return `Array [${value.length}]`;
  } else {
    return `Object {${Object.keys(value).length}}`;
  }
};

export const navigateSchema = (jsonSchema: any, path: string[]): any => {
  const current = path.shift() || '';
  let result: any = {};
  if (/\\d+\]/.test(current)) {
    const index = current.replace(/[\[\]]/g, '');
    result = navigateSchema(jsonSchema?.properties?.[index], path);
  } else if (current) {
    result = navigateSchema(jsonSchema?.properties?.[current] || jsonSchema?.properties?.['*'], path);
  } else {
    result = jsonSchema;
  }
  return result;
};

export const getSchemaObject = (jsonSchema: any, parentPath: string, fieldKey: string) => {
  const all = navigateSchema(
    jsonSchema,
    [...parentPath.split('.'), '*'].filter((path) => path != ''),
  );
  const detail = navigateSchema(
    jsonSchema,
    [...parentPath.split('.'), fieldKey].filter((path) => path != ''),
  );
  return all || detail || {};
};
