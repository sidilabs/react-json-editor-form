/* eslint-disable @typescript-eslint/no-explicit-any */
import './styles/index.scss';
import React from 'react';
import cloneDeep from 'lodash.clonedeep';
import JsonView from './components/JsonView';

export type JsonEditorProps = {
  width?: number | string;
  data: Record<string, any>;
  optionsMap?: Record<
    string,
    Array<{
      value: string;
      label?: string;
    }>
  >;
  schema?: any;
  onChange: (data: any) => void;
};

function JsonEditor({ data, onChange, schema, optionsMap, width }: JsonEditorProps) {
  return (
    <div className="jsonEditorContainer" style={{ width: width ?? 500, marginBottom: '20px' }}>
      <JsonView
        {...{
          //the cloneDeep is to ensure that an entirily new object is being used
          editObject: cloneDeep(data),
          setEditObject: onChange,
          optionsMap: optionsMap,
          schema: schema || {},
        }}
      />
    </div>
  );
}

export default JsonEditor;
