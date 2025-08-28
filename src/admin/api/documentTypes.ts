// src/admin/api/documentTypes.ts
import api from '@/shared/api/axios'

// ---- Types (align with backend DTO) ----
export type FieldType = 'text' | 'date' | 'number' | 'options'
export type ExportType = 'FILESYSTEM'
export type ExportFormat = 'PDF' | 'PDFA' | 'TIFF' | 'AS_IMPORTED'
export type ColorFormat = 'HIGH_16' | 'MEDIUM_8' | 'GRAYSCALE'

export type IndexingFieldDTO = {
  name: string
  displayName: string
  type: FieldType
  required: boolean
  visible: boolean
  unique: boolean
  defaultValue?: string | null
  options?: string[] // only for type = 'options'
  lookup?: boolean
}

export type DocumentTypeDTO = {
  id?: number
  departmentId: number
  name: string
  avgIndexTime?: number | null
  avgQualityTime?: number | null
  indexingFields: IndexingFieldDTO[]
  folderTemplate?: string | null
  fileTemplate?: string | null
  exportType: ExportType
  exportFormat: ExportFormat
  colorFormat: ColorFormat
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

// ---- Base path ----
const BASE = '/api/document-types'

// ---- API calls ----

// Active document types
export async function listDocumentTypesByDepartment(departmentId: number) {
  const { data } = await api.get<DocumentTypeDTO[]>(`${BASE}/department/${departmentId}`)
  return data
}

// Deleted (soft) document types
export async function listDeletedDocumentTypesByDepartment(departmentId: number) {
  const { data } = await api.get<DocumentTypeDTO[]>(`${BASE}/department/${departmentId}/deleted`)
  return data
}

// Single document type
export async function getDocumentType(id: number) {
  const { data } = await api.get<DocumentTypeDTO>(`${BASE}/${id}`)
  return data
}

// Create
export async function createDocumentType(payload: DocumentTypeDTO) {
  const { data } = await api.post<DocumentTypeDTO>(BASE, payload)
  return data
}

// Update
export async function updateDocumentType(id: number, payload: DocumentTypeDTO) {
  const { data } = await api.put<DocumentTypeDTO>(`${BASE}/${id}`, payload)
  return data
}

// --- Deletes / Restore ---

// Soft delete → mark as INACTIVE
export async function softDeleteDocumentType(id: number) {
  await api.delete(`${BASE}/${id}`) // 204
  return true
}

// Restore from INACTIVE back to ACTIVE
export async function restoreDocumentType(id: number) {
  await api.post(`${BASE}/${id}/restore`) // 204
  return true
}

// Hard delete → permanently remove
export async function hardDeleteDocumentType(id: number) {
  await api.delete(`${BASE}/${id}/hard`) // 204
  return true
}
