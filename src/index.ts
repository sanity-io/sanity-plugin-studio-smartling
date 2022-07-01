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
} from 'sanity-translations-tab'
import { SmartlingAdapter } from './adapter'

interface ConfigOptions {
  adapter: Adapter
  secretsNamespace: string | null
  exportForTranslation: (id: string) => Promise<Record<string, any>>
  importTranslation: (
    id: string,
    localeId: string,
    doc: string
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
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
  SmartlingAdapter,
  defaultDocumentLevelConfig,
  defaultFieldLevelConfig,
}
