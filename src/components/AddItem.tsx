/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusSquareOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Col, Input, InputNumber, Select, Space } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import React from 'react';
import { useContext, useState } from 'react';
import { ConfigContext } from '../store';
import { DataType, navigateSchema, typeMap } from '../common';

const AddItem = (props: { uniqueKey: string; sourceData: any; deepLevel: number; parentPath: string }) => {
  const { setEditObject, editObject, optionsMap, schema } = useContext(ConfigContext);
  const { uniqueKey, sourceData, parentPath } = props;
  const schemaResult = navigateSchema(schema, [...parentPath.split('.'), '*']);
  const isSchemaObject = Object.keys(schemaResult?.properties || {}).length > 0 || schemaResult?.type == 'object';

  const isArray = Array.isArray(sourceData);
  const [error, setError] = useState('');
  const [templateData, setTemplateData] = useState<any>({});
  const [showIncreaseMap, setShowIncreaseMap] = useState<any>({});
  const onClickIncrease = (key: string, value: boolean) => {
    setError('');
    showIncreaseMap[key] = value;
    templateData[key] = {};
    setTemplateData({
      ...templateData,
    });
    setShowIncreaseMap({
      ...showIncreaseMap,
    });
  };
  const changeInputKey = (uniqueKey: string, event: any) => {
    templateData[uniqueKey]['key'] = event.target.value;
    setTemplateData({ ...templateData });
  };
  const changeInputValue = (uniqueKey: string, value: any) => {
    templateData[uniqueKey]['value'] = value;
    setTemplateData({ ...templateData });
  };
  const onChangeTempType = (uniqueKey: string, type: DataType) => {
    templateData[uniqueKey]['type'] = type;
    templateData[uniqueKey]['value'] = typeMap[type];
    setTemplateData({
      ...templateData,
    });
  };
  const onConfirmIncrease = (uniqueKey: any, sourceData: any) => {
    const { key: aKey, value } = cloneDeep(templateData[uniqueKey]);
    if (Object.keys(sourceData).some((k) => k == aKey)) {
      setError('Key already exists');
      return;
    } else if (!isArray && (aKey == undefined || aKey === '')) {
      setError('Key can not be empty');
      return;
    }

    if (isSchemaObject) {
      const objectRequired: any = {};
      Object.entries(schemaResult.properties ?? {}).forEach(([key, valueProperty]: [string, any]) => {
        const hasDefault = valueProperty.default !== undefined;
        if (hasDefault) {
          objectRequired[key] = valueProperty.default;
        } else {
          const typeMap: any = {
            string: '',
            array: [],
            object: {},
            number: 0,
            boolean: false,
          };
          objectRequired[key] = typeMap[valueProperty.type];
        }
      });

      sourceData[aKey] = objectRequired;
    } else {
      const data = value === undefined ? '' : value;
      if (isArray) {
        sourceData.push(data);
      } else {
        sourceData[aKey] = data;
      }
    }
    setEditObject({ ...editObject });
    onClickIncrease(uniqueKey, false);
  };

  const getTypeTemplate = (type: DataType) => {
    const _type = isSchemaObject ? null : type;
    switch (_type) {
      case DataType.STRING:
        const currentOptions = optionsMap?.[templateData[uniqueKey]?.['key']] ?? [];
        return (
          <AutoComplete
            style={{ width: 100 }}
            size="small"
            options={currentOptions}
            onChange={(value) => changeInputValue(uniqueKey, value)}
            filterOption={(inputValue, option) =>
              `${(option as any).value}`.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
          />
        );
      case DataType.NUMBER:
        return (
          <InputNumber
            size="small"
            style={{ width: '100px' }}
            onBlur={(event) => changeInputValue(uniqueKey, +event.target.value)}
          />
        );
      case DataType.BOOLEAN:
        return (
          <Select
            size="small"
            style={{ width: '100px' }}
            defaultValue={true}
            onChange={(value: boolean) => {
              changeInputValue(uniqueKey, value);
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
      default:
        return null;
    }
  };
  return (
    <div className="addItem" key={uniqueKey} data-parent-path={parentPath}>
      {showIncreaseMap[uniqueKey] ? (
        <>
          <Space>
            {!isArray && (
              <div>
                <Input
                  size="small"
                  style={{ width: '100px' }}
                  onChange={(event) => changeInputKey(uniqueKey, event)}
                ></Input>
              </div>
            )}
            <div>
              <Select
                size="small"
                style={{ width: '100px' }}
                onChange={(value) => onChangeTempType(uniqueKey, value)}
                defaultValue={isSchemaObject ? DataType.OBJECT : DataType.STRING}
              >
                {isSchemaObject ? (
                  <Select.Option value={DataType.OBJECT} key={DataType.OBJECT} style={{ width: '100px' }}>
                    {DataType.OBJECT}
                  </Select.Option>
                ) : (
                  Object.values(DataType).map((item) => (
                    <Select.Option value={item} key={item} style={{ width: '100px' }}>
                      {item}
                    </Select.Option>
                  ))
                )}
              </Select>
            </div>
            {getTypeTemplate(templateData[uniqueKey]['type'] || DataType.STRING)}
            <div>
              <Space>
                <Button size="small" type="primary" onClick={() => onConfirmIncrease(uniqueKey, sourceData)}>
                  Confirm
                </Button>
                <Button size="small" onClick={() => onClickIncrease(uniqueKey, false)}>
                  Cancel
                </Button>
              </Space>
            </div>
          </Space>
          {!!error && <div style={{ color: 'red', margin: '2px 0 0 2px' }}>{error}</div>}
        </>
      ) : (
        <Col span={8}>
          <PlusSquareOutlined rev="" style={{ color: '#1E88E5' }} onClick={() => onClickIncrease(uniqueKey, true)} />
        </Col>
      )}
    </div>
  );
};
export default AddItem;
