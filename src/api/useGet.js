import { useMemo } from 'react';
import stringify from 'fast-json-stable-stringify';
import attachmentsAsUint8Arrays from '../attachmentsAsUint8Arrays';
import changes from '../changes';
import useDB from '../useDB';

const UINT8ARRAY = 'u8a';
const ALLOWED_LIVE_OPTIONS = ['attachments', 'ajax', 'binary', 'id'];

async function nextState(binary, doc) {
  return binary && doc && !doc._deleted
    ? {
        ...doc,
        _attachments: await attachmentsAsUint8Arrays(doc._attachments)
      }
    : doc;
}

export default useListen =>
  function useGet(db, options = db) {
    if (arguments.length < 2) {
      db = undefined;
    }
    db = useDB(db, {
      callee: 'useGet',
      example: 'useGet(db, options)'
    });
    const { id, attachments, ...otherOptions } = options;
    const binary = attachments === UINT8ARRAY;
    const optionsWithAttachmentAndBinaryOption = useMemo(
      () => ({
        binary,
        ...otherOptions,
        attachments: !!attachments
      }),
      [binary, stringify(otherOptions), !!attachments]
    );
    return useListen(db, options, async setValue => {
      try {
        setValue(
          await nextState(
            binary,
            await db.get(id, optionsWithAttachmentAndBinaryOption)
          )
        );
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
        setValue(null);
      }

      // Live?
      if (
        Object.keys(options).every(option =>
          ALLOWED_LIVE_OPTIONS.includes(option)
        )
      ) {
        return db::changes(
          {
            ...optionsWithAttachmentAndBinaryOption,
            live: true,
            include_docs: true,
            since: 'now',
            doc_ids: [id]
          },
          async ({ doc }) => {
            setValue(await nextState(binary, doc));
          }
        );
      }
    });
  };
