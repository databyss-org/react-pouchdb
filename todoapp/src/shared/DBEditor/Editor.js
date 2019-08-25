import { useCallback } from 'react';
import { useDB, useGet } from 'react-pouchdb/browser';
import useT from 'useT';
import JSONEditorComponent from 'JSONEditorComponent';

export default function Editor({ id, propName, useReset, dbName }) {
  const t = useT();
  const resource = useGet(dbName, { id });
  const { put } = useDB(dbName);
  const onChangeJSON = useCallback(
    json => {
      put({
        ...resource,
        [propName]: json
      });
    },
    [propName, put, resource]
  );
  const reset = useReset();
  return (
    resource && (
      <>
        <div style={{ marginBottom: 10 }}>
          <JSONEditorComponent
            json={resource[propName]}
            onChangeJSON={onChangeJSON}
            mode="form"
          />
        </div>
        <div className="cleanslate">
          <button onClick={reset}>{t('reset')}</button>
        </div>
      </>
    )
  );
}
