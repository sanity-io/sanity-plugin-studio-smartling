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
import { SanityDocument } from '@sanity/types'

const defaultDocumentLevelConfig = {
  exportForTranslation: async (id: string) => {
    try {
      const doc = await findLatestDraft(id)
      const serialized = BaseDocumentSerializer.serializeDocument(
        doc,
        'document'
      )
      //needed for lookup by translation tab
      serialized.name = id
      return serialized
    } catch (err) {
      throw err
    }
  },
  importTranslation: async (id: string, localeId: string, document: string) => {
    try {
      const deserialized = BaseDocumentDeserializer.deserializeDocument(
        document
      ) as SanityDocument
      await documentLevelPatch(id, deserialized, localeId)
    } catch (err) {
      throw err
    }
  },
  adapter: SmartlingAdapter,
}

const defaultFieldLevelConfig = {
  exportForTranslation: async (id: string) => {
    try {
      const doc = await findLatestDraft(id)
      const serialized = BaseDocumentSerializer.serializeDocument(doc, 'field')
      //needed for lookup by translation tab
      serialized.name = id
      return serialized
    } catch (err) {
      throw err
    }
  },
  importTranslation: async (id: string, localeId: string, document: string) => {
    try {
      const deserialized = BaseDocumentDeserializer.deserializeDocument(
        document
      ) as SanityDocument
      await fieldLevelPatch(id, deserialized, localeId)
    } catch (err) {
      throw err
    }
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
