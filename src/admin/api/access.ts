// =============================================
// FILE: src/admin/api/access.ts
// =============================================
import axios from "@/shared/api/axios";

export type ID = number | string;

export type BatchDTO = { id: number; name: string };
export type BatchPermissionDTO = {
  batchId: number;
  batchName?: string;
  scan: boolean;
  index: boolean;
  quality: boolean;
};
export type GroupDTO = {
  id: number;
  name: string;
  batchPermissions?: BatchPermissionDTO[];
};
export type Paged<T> = { content: T[]; number: number; size: number; totalElements: number; totalPages: number };

export type UserDTO = {
  id: number;
  username: string;
  fullName?: string | null;
  dailyTargetMinutes?: number | null;
  roles?: string[];
  groups?: string[];
};

// ------ Groups ------
export async function listGroups(params?: { q?: string; page?: number; size?: number }) {
  const { q, page = 0, size = 50 } = params || {};
  const r = await axios.get<Paged<GroupDTO>>("/api/admin/access/groups", { params: { q, page, size } });
  return r.data;
}
export async function getGroup(id: ID) {
  const r = await axios.get<GroupDTO>(`/api/admin/access/groups/${id}`);
  return r.data;
}
export async function createGroup(payload: { name: string; batchPermissions: BatchPermissionDTO[] }) {
  const r = await axios.post<GroupDTO>("/api/admin/access/groups", payload);
  return r.data;
}
export async function updateGroup(id: ID, payload: { name?: string; batchPermissions?: BatchPermissionDTO[] }) {
  const r = await axios.put<GroupDTO>(`/api/admin/access/groups/${id}`, payload);
  return r.data;
}
export async function deleteGroup(id: ID) {
  await axios.delete(`/api/admin/access/groups/${id}`);
}
export async function listAllBatchesAsPermissions() {
  const r = await axios.get<BatchPermissionDTO[]>("/api/admin/access/groups/_all-batches");
  return r.data;
}

// ------ Users ------
export async function listUsers(params?: { q?: string; page?: number; size?: number }) {
  const { q, page = 0, size = 50 } = params || {};
  const r = await axios.get<Paged<UserDTO>>("/api/admin/access/users", { params: { q, page, size } });
  return r.data;
}
export async function getUser(id: ID) {
  const r = await axios.get<UserDTO>(`/api/admin/access/users/${id}`);
  return r.data;
}
export async function createUser(payload: { username: string; password: string; fullName?: string; dailyTargetMinutes?: number; roles?: string[]; groupIds?: number[]; }) {
  const r = await axios.post<UserDTO>("/api/admin/access/users", payload);
  return r.data;
}
export async function updateUser(id: ID, payload: { fullName?: string; dailyTargetMinutes?: number; roles?: string[]; groupIds?: number[]; }) {
  const r = await axios.put<UserDTO>(`/api/admin/access/users/${id}`, payload);
  return r.data;
}

