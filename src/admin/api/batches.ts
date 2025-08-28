import { api } from "@/shared/api/axios";

// ===== Types =====
export type WorkflowStep = "SCAN" | "INDEX" | "QUALITY" | "EXPORT";
export type SeparationMethod = "NONE" | "DOCUMENT_SEPARATORS" | "NUMBER_OF_PAGES";

export interface BatchListItem {
  id: number;
  name: string;
  departmentName?: string | null;
}

export interface Batch {
  id: number;
  departmentName?: string | null;
  name: string;
  namingFormula?: string | null;
  expectedScanTimeSec?: number | null;
  workflow: WorkflowStep[];
  separationMethod: SeparationMethod;
  separationInfo?: string | null;
  qualityPercentage?: number | null;
  autoImportPath?: string | null;
  autoProcessImported: boolean;
  selectedDocumentTypes: { id: number; name: string }[];
}

export interface BatchCreateUpdateRequest {
  departmentName?: string | null;
  name: string;
  namingFormula?: string | null;
  expectedScanTimeSec?: number | null;
  workflow: WorkflowStep[];
  separation: { method: SeparationMethod; info?: string | null };
  qualityPercentage?: number | null;
  autoImportPath?: string | null;
  autoProcessImported?: boolean;
  selectedDocumentTypeIds: number[];
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** ===== DocType (user view) for dynamic formula chips ===== */
export type DocTypeField = {
  name: string;
  displayName?: string | null;
  // extend here if backend returns more (type, required, visible, etc.)
};

export type DocTypeWithFields = {
  id: number;
  name: string;
  fieldsVisibleToUser: DocTypeField[];
  folderTemplate: string;
  fileTemplate: string;
  exportFormat: string;
  colorFormat: string;
};

export type DocTypeBrief = { id: number; name: string };

// ===== API =====
export async function listBatches(params?: { page?: number; size?: number; q?: string }) {
  const { data } = await api.get<PageResponse<BatchListItem>>("/api/batches", {
    params: { page: 1, size: 20, ...params },
  });
  return data;
}

export async function getBatch(id: number) {
  const { data } = await api.get<Batch>(`/api/batches/${id}`);
  return data;
}

export async function createBatch(payload: BatchCreateUpdateRequest) {
  const { data } = await api.post<Batch>("/api/batches", payload);
  return data;
}

export async function updateBatch(id: number, payload: BatchCreateUpdateRequest) {
  const { data } = await api.put<Batch>(`/api/batches/${id}`, payload);
  return data;
}

export async function deleteBatch(id: number) {
  await api.delete(`/api/batches/${id}`);
}

/** ===== Active Doc Types (two helpers) ===== */
/** 1) Brief list (kept for backward compatibility) */
export async function listActiveDocTypes() {
  const { data } = await api.get<DocTypeWithFields[]>("/api/user/document-types/active");
  return data.map(d => ({ id: d.id, name: d.name })) as DocTypeBrief[];
}

/** 2) Full detail with fields (use this for formula chips) */
export async function listActiveDocTypesFull() {
  const { data } = await api.get<DocTypeWithFields[]>("/api/user/document-types/active");
  return data;
}
