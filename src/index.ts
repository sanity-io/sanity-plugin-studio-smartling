import {SerializedDocument} from 'sanity-naive-html-serializer'
import {
  TranslationsTab,
  baseDocumentLevelConfig,
  baseFieldLevelConfig,
  findLatestDraft,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
  Adapter,
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
    context: TranslationFunctionContext
  ) => Promise<SerializedDocument>
  importTranslation: (
    id: string,
    localeId: string,
    doc: string,
    context: TranslationFunctionContext
  ) => Promise<void>
}
const defaultDocumentLevelConfig: ConfigOptions = {
  ...baseDocumentLevelConfig,
  adapter: SmartlingAdapter,
}

const defaultFieldLevelConfig: ConfigOptions = {
  ...baseFieldLevelConfig,
  adapter: SmartlingAdapter,
}

export {
  TranslationsTab,
  findLatestDraft,
  documentLevelPatch,
  fieldLevelPatch,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
  SmartlingAdapter,
  defaultDocumentLevelConfig,
  defaultFieldLevelConfig,
}
