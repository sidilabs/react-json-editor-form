/* eslint-disable @typescript-eslint/no-explicit-any */
import { MinusSquareOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import React from 'react';
import { ConfigContext } from '../store';
import { getTypeString, DataType, navigateSchema, getSchemaObject } from '../common';
import { useContext } from 'react';

function ToolsView(props: {
  fieldValue: any;
  fieldKey: string;
  uniqueKey: string;
  sourceData: any;
  parentPath: string;
  custom?: string;
}) {
  const { schema } = useContext(ConfigContext);

  //parente fixed - any direct property cannot be changed
  if (navigateSchema(schema, props.parentPath.split('.'))?.fixed) {
    return null;
  }

  const schemaObject = getSchemaObject(schema, props.parentPath, props.fieldKey);
  const isObjectInSchema = Object.keys(schemaObject.properties || {}).length > 0;

  const isSchemaType = isObjectInSchema || schemaObject.type !== undefined;
  const schemaType = isObjectInSchema ? 'object' : schemaObject.type;

  return (
    <ConfigContext.Consumer>
      {({ onChangeType, onClickDelete }) => (
        <span className="tools" data-parent-path={props.parentPath} data-custom={props.custom}>
          <span>
            <Select
              size="small"
              style={{ width: '100px' }}
              onChange={(value) => onChangeType(value, props.uniqueKey)}
              defaultValue={getTypeString(props.fieldValue)}
            >
              {isSchemaType ? (
                <Select.Option value={schemaType} key={schemaType}>
                  {schemaType}
                </Select.Option>
              ) : (
                Object.values(DataType).map((item: string) => (
                  <Select.Option value={item} key={item}>
                    {item}
                  </Select.Option>
                ))
              )}
            </Select>
          </span>
          {!schemaObject.mandatory ? (
            <span className="iconSubtraction">
              <MinusSquareOutlined
                rev=""
                style={{ color: '#E74C3C' }}
                onClick={() => onClickDelete(props.fieldKey, props.sourceData)}
              />
            </span>
          ) : (
            <span className="iconSubtraction">
              <MinusSquareOutlined rev="" style={{ color: 'gray' }} />
            </span>
          )}
        </span>
      )}
    </ConfigContext.Consumer>
  );
}
export default ToolsView;
