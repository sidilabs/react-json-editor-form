/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext } from 'react';
import { getPlaceholder, isObject } from '../common';
import { ConfigContext } from '../store';
import AddItem from './AddItem';
import CollapsePart from './Collapse';
import ToolsView from './Tools';

type Props = {
  fieldValue: any[];
  fieldKey: string;
  sourceData: any;
  getValue: any;
  deepLevel: number;
  parentUniqueKey: string;
  parentPath: string;
  schema: any;
};

function ArrayView(props: Props) {
  const { allowMap } = useContext(ConfigContext);

  return (
    <div className="arrayContent">
      <div style={{ marginTop: '10px' }}>
        {props.fieldValue.map((item: any, index: number) => {
          const uniqueKey = `${props.parentUniqueKey}-${index}`;
          const isObjectResult = isObject(item);
          const newParentPath = `${props.parentPath}[${index}]`;

          const content = (
            <>
              <span className="jsonKey">
                <span style={{ marginRight: '5px' }}>{index + 1}.</span>
              </span>
              <CollapsePart uniqueKey={uniqueKey} fieldValue={item} />
              {isObjectResult ? <b className="mt15">{getPlaceholder(item)}</b> : null}
              {!isObjectResult && (
                <span className="jsonValue">
                  {props.getValue(
                    item,
                    index,
                    props.fieldValue,
                    props.deepLevel + 1,
                    uniqueKey,
                    newParentPath,
                    props.schema,
                    allowMap,
                  )}
                </span>
              )}
            </>
          );
          return (
            <div key={uniqueKey} className="indexLine" data-key={uniqueKey}>
              <div className="lineData" data-isobject={isObjectResult}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center ' }}>
                  {isObjectResult ? <div style={{ display: 'flex', alignItems: 'center' }}>{content}</div> : content}
                  {isObjectResult && (
                    <ToolsView
                      uniqueKey={uniqueKey}
                      fieldValue={item}
                      fieldKey={`${index}`}
                      sourceData={props.fieldValue}
                      parentPath={newParentPath}
                      custom="array"
                    />
                  )}
                </div>
                {!isObjectResult && (
                  <ToolsView
                    uniqueKey={uniqueKey}
                    fieldValue={item}
                    fieldKey={`${index}`}
                    sourceData={props.fieldValue}
                    parentPath={newParentPath}
                    custom="array"
                  />
                )}
                {isObjectResult && allowMap[uniqueKey] && (
                  <span className="jsonValue">
                    {props.getValue(
                      item,
                      index,
                      props.fieldValue,
                      props.deepLevel + 1,
                      uniqueKey,
                      newParentPath,
                      props.schema,
                      allowMap,
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <AddItem
          key={props.parentUniqueKey}
          uniqueKey={props.parentUniqueKey}
          deepLevel={props.deepLevel}
          sourceData={props.fieldValue}
          parentPath={`${props.parentPath}[${props.fieldValue.length}]`}
        />
      </div>
    </div>
  );
}
export default ArrayView;
