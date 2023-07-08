/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef } from 'react';
import { getPlaceholder, getSchemaObject, isObject, navigateSchema } from '../common';
import AddItem from './AddItem';
import ToolsView from './Tools';
import CollapsePart from './Collapse';

type Props = {
  sourceData: any;
  deepLevel?: number;
  parentUniqueKey?: string;
  parentPath?: string;
  schema: any;
  onChangeKey: any;
  allowMap: any;
  getValue: any;
};

const defaultLevel = 1;
const RenderJsonConfig = ({
  sourceData,
  deepLevel,
  parentUniqueKey,
  parentPath,
  schema,
  onChangeKey,
  allowMap,
  getValue,
}: Props) => {
  const filteredAllowMap: { [key: string]: boolean } = {};
  Object.entries(allowMap as { [key: string]: boolean }).forEach(([key, value]) => {
    const r = new RegExp(parentUniqueKey as string);
    if (r.test(key)) {
      filteredAllowMap[key] = value;
    }
  });
  const timerRef = useRef(0);

  deepLevel = deepLevel ?? 1;
  parentUniqueKey = parentUniqueKey ?? `${deepLevel}`;
  parentPath = parentPath ?? '';

  const keyList = Object.keys(sourceData);
  const isFixed = !!navigateSchema(schema, parentPath.split('.'))?.fixed;

  const renderList = useMemo(() => {
    if (!keyList.length) {
      return (
        <div style={{ marginLeft: '20px' }}>
          <AddItem
            uniqueKey={'defaultKay'}
            deepLevel={deepLevel as number}
            sourceData={sourceData}
            parentPath={parentPath as string}
          />
        </div>
      );
    }
    return (
      <div className="objectContent" style={{ marginLeft: defaultLevel === deepLevel ? '0' : '15px' }}>
        {keyList.map((fieldKey, index) => {
          const uniqueKey = `${parentUniqueKey}-${index}`;
          const fieldValue = sourceData[fieldKey];
          const placeHolder = getPlaceholder(fieldValue);
          const isObjectResult = isObject(fieldValue);

          const schemaObject = getSchemaObject(schema, parentPath as string, fieldKey);

          const errorDuplicatedKey = /^\$E-\d+\$_/.test(fieldKey);

          return (
            <div key={uniqueKey} className="indexLine" data-key={uniqueKey}>
              <div className="lineData" data-isobject={isObjectResult}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CollapsePart uniqueKey={uniqueKey} fieldValue={fieldValue} />
                    <span className="jsonKey">
                      {isFixed || schemaObject.mandatory ? (
                        <span style={{ margin: '5px', fontWeight: 'bold' }}>{fieldKey}</span>
                      ) : (
                        <input
                          ref={(ref) => {
                            if (ref) {
                              ref.value = fieldKey.replace(/^\$E-\d+\$_/, '');
                            }
                          }}
                          style={{ width: '100px' }}
                          placeholder={fieldKey}
                          onChange={(event) => {
                            if (timerRef.current) {
                              clearTimeout(timerRef.current);
                            }
                            timerRef.current = +setTimeout(() => {
                              onChangeKey(event, fieldKey, uniqueKey, sourceData, parentUniqueKey);
                            }, 800);
                          }}
                          data-error={errorDuplicatedKey}
                        />
                      )}
                    </span>
                    {!!placeHolder && <div style={{ margin: '5px' }}>{placeHolder}</div>}
                  </div>
                  {!isObjectResult && (
                    <span className="jsonValue">
                      {getValue(fieldValue, fieldKey, sourceData, deepLevel, uniqueKey, parentPath, schema, allowMap)}
                    </span>
                  )}
                  {isObjectResult && (
                    <ToolsView
                      uniqueKey={uniqueKey}
                      fieldValue={fieldValue}
                      fieldKey={fieldKey}
                      sourceData={sourceData}
                      parentPath={parentPath as string}
                      custom="json"
                    />
                  )}
                </div>

                {isObjectResult && allowMap[uniqueKey] && (
                  <span className="jsonValue">
                    {getValue(fieldValue, fieldKey, sourceData, deepLevel, uniqueKey, parentPath, schema, allowMap)}
                  </span>
                )}
                {!isObjectResult && (
                  <ToolsView
                    uniqueKey={uniqueKey}
                    fieldValue={fieldValue}
                    fieldKey={fieldKey}
                    sourceData={sourceData}
                    parentPath={parentPath as string}
                    custom="json"
                  />
                )}
              </div>
              {errorDuplicatedKey && <div style={{ color: 'red' }}>Duplicated key</div>}
            </div>
          );
        })}
        {!isFixed && (
          <div>
            <AddItem
              key={parentUniqueKey}
              uniqueKey={parentUniqueKey as string}
              deepLevel={deepLevel as number}
              sourceData={sourceData}
              parentPath={parentPath as string}
            />
          </div>
        )}
      </div>
    );
  }, [JSON.stringify(sourceData), JSON.stringify(filteredAllowMap), isFixed]);

  return renderList;
};

export default RenderJsonConfig;
