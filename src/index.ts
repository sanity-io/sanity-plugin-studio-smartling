import { TranslationsTab } from 'sanity-translations-tab'
import {
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentPatcher,
  defaultStopTypes,
  customSerializers,
} from 'sanity-naive-html-serializer'
import { SmartlingAdapter } from './adapter'

const defaultDocumentLevelConfig = {
  exportForTranslation: (id: string) =>
    BaseDocumentSerializer.serializeDocument(
      id,
      'document',
      'en',
      defaultStopTypes,
      customSerializers
    ),
  importTranslation: (id: string, localeId: string, document: string) => {
    return BaseDocumentDeserializer.deserializeDocument(
      id,
      document
    ).then((deserialized: Record<string, any>) =>
      BaseDocumentPatcher.documentLevelPatch(deserialized, id, localeId)
    )
  },
  adapter: SmartlingAdapter
}

const defaultFieldLevelConfig = {
  exportForTranslation: (id: string) =>
    BaseDocumentSerializer.serializeDocument(
      id,
      'field',
      'en',
      defaultStopTypes,
      customSerializers
    ),
  importTranslation: (id: string, localeId: string, document: string) => {
    return BaseDocumentDeserializer.deserializeDocument(
      id,
      document
    ).then((deserialized: Record<string, any>) =>
      BaseDocumentPatcher.fieldLevelPatch(deserialized, id, localeId, 'en')
    )
  },
  adapter: SmartlingAdapter,
}

export {
  TranslationsTab,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentPatcher,
  defaultStopTypes,
  customSerializers,
  SmartlingAdapter,
  defaultDocumentLevelConfig,
  defaultFieldLevelConfig
}
