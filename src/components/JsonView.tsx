/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select } from 'antd';
import React, { useRef, useState } from 'react';
import { DataType, getQuoteAddress, getSchemaObject, getTypeString, typeMap } from '../common';

import { ConfigContext } from '../store';
import ArrayView from './ArrayView';

import RenderJsonConfig from './RenderJsonConfig';
import { useCallback } from 'react';
import cloneDeep from 'lodash.clonedeep';

export type JsonViewProps = {
  setEditObject: any;
  editObject: Record<string, any>;
  optionsMap?: Record<
    string,
    Array<{
      value: string;
      label?: string;
    }>
  >;
  schema: any;
};

function JsonView(props: JsonViewProps) {
  const { editObject, setEditObject, optionsMap } = props;

  const collisionRef = useRef(0);
  const [allowMap, setAllowMap] = useState<Record<string, boolean>>({});

  const syncData = (data: Record<string, any>) => {
    setEditObject({ ...data });
  };

  const onClickDelete = (key: string, sourceData: any) => {
    if (Array.isArray(sourceData)) {
      sourceData.splice(+key, 1);
    } else {
      Reflect.deleteProperty(sourceData, key);
    }
    syncData(editObject);
  };

  const onChangeType = (type: DataType, uniqueKey: string) => {
    const newEditObject = getQuoteAddress(typeMap[type], uniqueKey, editObject);
    syncData(newEditObject);
  };

  const onChangeKey = (
    event: React.ChangeEvent<HTMLInputElement>,
    currentKey: string,
    uniqueKey: string,
    source: Record<string, any>,
    parentKey: string,
  ) => {
    const newValue: Record<string, any> = {};
    const oldKeys = Object.keys(source);
    let hasCollision = false;
    const currentIndex = +(/.*-(\d+)$/.exec(uniqueKey)?.[1] || -1);
    if (oldKeys.some((oldKey, index) => oldKey == event.target.value && index != currentIndex)) {
      hasCollision = true;
      collisionRef.current++;
    }
    for (const [key, value] of Object.entries(source)) {
      if (key === currentKey) {
        newValue[(hasCollision ? `$E-${collisionRef.current}$_` : '') + event.target.value] = source[key];
      } else {
        newValue[key] = value;
      }
    }
    let newFinalData;

    if (!/^1-\d+$/.test(uniqueKey)) {
      //delete old key
      newFinalData = getQuoteAddress(newValue, uniqueKey, editObject, true);
      //add new key with content
      newFinalData = getQuoteAddress(newValue, parentKey, newFinalData);
    } else {
      newFinalData = newValue;
    }
    syncData(newFinalData);
  };

  const onChangeValue = (value: any, key: string, source: Record<string, any>, deepLevel = 0, parentPath: string) => {
    source[key] = value;
    if (deepLevel == 1) {
      syncData(source);
    } else {
      const arrPath: string[] = [];
      parentPath.split('.').forEach((p) => {
        if (/.*\[\d+\]/.test(p)) {
          arrPath.push(p.replace(/\[\d*\]/, ''));
        } else {
          arrPath.push(p);
        }
      });
      syncData(dataUpdate(source, arrPath));
    }
  };

  const dataUpdate = (data: any, path: string[]) => {
    const workingPath = [...path];
    const lastKey = workingPath.pop() as string;
    const newObject = cloneDeep(editObject);
    let current = newObject;
    workingPath.forEach((key) => {
      current = current[key];
    });
    current[lastKey] = data;
    return newObject;
  };

  const timerValueRef = useRef(0);
  const onChangeValueDelayed = (
    value: any,
    key: string,
    source: Record<string, any>,
    deepLevel = 0,
    parentPath: string,
  ) => {
    if (timerValueRef.current) {
      clearTimeout(timerValueRef.current);
    }
    timerValueRef.current = +setTimeout(() => {
      onChangeValue(value, key, source, deepLevel, parentPath);
    }, 800);
  };

  const getValue = useCallback(
    (
      fieldValue: any,
      fieldKey: string,
      sourceData: any,
      deepLevel: number,
      parentUniqueKey: string,
      parentPath: string,
      schema: any,
      allowMap: any,
    ) => {
      const thatType = getTypeString(fieldValue);
      const newParentPath = `${!!parentPath ? parentPath + '.' : ''}${fieldKey}`;
      switch (thatType) {
        case DataType.ARRAY:
          return (
            <ArrayView
              fieldValue={fieldValue}
              fieldKey={fieldKey}
              sourceData={sourceData}
              deepLevel={deepLevel}
              parentUniqueKey={parentUniqueKey}
              getValue={getValue}
              parentPath={newParentPath}
              schema={schema}
            />
          );
        case DataType.OBJECT:
          return (
            <span>
              <RenderJsonConfig
                sourceData={fieldValue}
                schema={schema}
                deepLevel={deepLevel + 1}
                parentUniqueKey={parentUniqueKey}
                parentPath={newParentPath}
                onChangeKey={onChangeKey}
                allowMap={allowMap}
                getValue={getValue}
              />
            </span>
          );
        case DataType.STRING:
          const fieldSchema = getSchemaObject(schema, parentPath, fieldKey);
          if (fieldSchema.options?.length > 0) {
            return (
              <Select
                size="small"
                style={{ width: '100px' }}
                defaultValue={'string'}
                onChange={(value: string) => {
                  onChangeValueDelayed(value, fieldKey, sourceData, deepLevel, parentPath);
                }}
              >
                {fieldSchema.options.map((option: string) => (
                  <Select.Option key={option} value={option} label="true">
                    {option}
                  </Select.Option>
                ))}
              </Select>
            );
          } else {
            return (
              <input
                ref={(ref) => {
                  if (ref) {
                    ref.value = fieldValue;
                  }
                }}
                style={{ width: 100 }}
                onChange={(evt) => {
                  onChangeValueDelayed(evt.currentTarget.value, fieldKey, sourceData, deepLevel, parentPath);
                }}
              />
            );
          }
        case DataType.NUMBER:
          return (
            <input
              ref={(ref) => {
                if (ref) {
                  ref.value = fieldValue;
                }
              }}
              className={'inputNumber'}
              type="number"
              style={{ width: '100px' }}
              onChange={(event) => {
                onChangeValueDelayed(+(event.target.value || 0), fieldKey, sourceData, deepLevel, parentPath);
              }}
            />
          );
        case DataType.BOOLEAN:
          return (
            <Select
              size="small"
              style={{ width: '100px' }}
              defaultValue={Boolean(fieldValue)}
              onChange={(value: boolean) => {
                onChangeValueDelayed(value, fieldKey, sourceData, deepLevel, parentPath);
              }}
            >
              <Select.Option value={true} label="true">
                true
              </Select.Option>
              <Select.Option value={false} label="false">
                false
              </Select.Option>
            </Select>
          );
      }
    },
    [],
  );
  const onChangeAllow = (uniqueKey: string) => {
    allowMap[uniqueKey] = !allowMap[uniqueKey];
    setAllowMap({ ...allowMap });
  };

  return (
    <ConfigContext.Provider
      value={{
        editObject,
        setEditObject: syncData,
        optionsMap,

        onChangeType,
        onClickDelete,
        onChangeAllow,
        allowMap,
        schema: props.schema,
      }}
    >
      <RenderJsonConfig
        sourceData={editObject}
        schema={props.schema}
        onChangeKey={onChangeKey}
        allowMap={allowMap}
        getValue={getValue}
      />
    </ConfigContext.Provider>
  );
}

export default JsonView;
