import { TranslationsTab } from 'sanity-translations-tab'
import {
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
} from 'sanity-naive-html-serializer'
import { SmartlingAdapter } from './adapter'
import { findLatestDraft, documentLevelPatch, fieldLevelPatch } from './helpers'
import { SanityDocument } from '@sanity/types/dist/dts'

const defaultDocumentLevelConfig = {
  exportForTranslation: async (id: string) => {
    const doc = await findLatestDraft(id)
    return BaseDocumentSerializer.serializeDocument(doc, 'document')
  },
  importTranslation: (id: string, localeId: string, document: string) => {
    return BaseDocumentDeserializer.deserializeDocument(
      document
    ).then((deserialized: SanityDocument) =>
      documentLevelPatch(id, deserialized, localeId)
    )
  },
  adapter: SmartlingAdapter,
}

const defaultFieldLevelConfig = {
  exportForTranslation: async (id: string) => {
    const doc = await findLatestDraft(id)
    return BaseDocumentSerializer.serializeDocument(doc, 'field')
  },
  importTranslation: (id: string, localeId: string, document: string) => {
    return BaseDocumentDeserializer.deserializeDocument(
      document
    ).then((deserialized: SanityDocument) =>
      fieldLevelPatch(id, deserialized, localeId)
    )
  },
  adapter: SmartlingAdapter,
}

export {
  TranslationsTab,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
  SmartlingAdapter,
  defaultDocumentLevelConfig,
  defaultFieldLevelConfig,
}
