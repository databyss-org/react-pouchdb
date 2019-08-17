import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useResetResourceBundle, { dbName } from 'useResetResourceBundle';
import { useFind } from 'react-pouchdb/browser';
import { availableLanguages } from '../i18n';

export default function AddResourceBundle() {
  const { i18n } = useTranslation();
  const resources = useFind(dbName, {
    selector: { _id: { $in: i18n.languages } }
  });
  useEffect(() => {
    resources.forEach(({ _id: lng, bundle }) =>
      i18n.addResourceBundle(lng, 'translation', bundle)
    );
  }, [resources, i18n]);
  useAddAvailableResourceBundles();
  return null;
}

function useAddAvailableResourceBundles() {
  const resources = useFind(dbName, {
    selector: {}
  });
  const reset = useResetResourceBundle();
  useEffect(() => {
    (async () => {
      if (
        !availableLanguages.every(lng =>
          resources.find(({ _id }) => _id === lng)
        )
      ) {
        reset();
      }
    })();
  }, [resources, reset]);
  return null;
}
