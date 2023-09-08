import {SerializedDocument} from 'sanity-naive-html-serializer'
import {
  TranslationsTab,
  baseDocumentLevelConfig,
  legacyDocumentLevelConfig as baseLegacyDocumentLevelConfig,
  baseFieldLevelConfig,
  findLatestDraft,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
  Adapter,
  legacyDocumentLevelPatch,
  documentLevelPatch,
  fieldLevelPatch,
  TranslationFunctionContext,
} from 'sanity-translations-tab'
import {SmartlingAdapter} from './adapter'

interface ConfigOptions {
  adapter: Adapter
  secretsNamespace: string | null
  exportForTranslation: (
    id: string,
    context: TranslationFunctionContext,
  ) => Promise<SerializedDocument>
  importTranslation: (
    id: string,
    localeId: string,
    doc: string,
    context: TranslationFunctionContext,
  ) => Promise<void>
}
const defaultDocumentLevelConfig: ConfigOptions = {
  ...baseDocumentLevelConfig,
  adapter: SmartlingAdapter,
}

const legacyDocumentLevelConfig: ConfigOptions = {
  ...baseLegacyDocumentLevelConfig,
  adapter: SmartlingAdapter,
}

const defaultFieldLevelConfig: ConfigOptions = {
  ...baseFieldLevelConfig,
  adapter: SmartlingAdapter,
}

export {
  TranslationsTab,
  findLatestDraft,
  legacyDocumentLevelPatch,
  documentLevelPatch,
  fieldLevelPatch,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
  SmartlingAdapter,
  legacyDocumentLevelConfig,
  defaultDocumentLevelConfig,
  defaultFieldLevelConfig,
}
