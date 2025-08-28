// src/admin/pages/DocumentTypesRestorePage.tsx
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listDeletedDocumentTypesByDepartment,
  restoreDocumentType,
  hardDeleteDocumentType, // <-- use this name
  DocumentTypeDTO,
} from '@/admin/api/documentTypes'


const DEPT_ID = 1

export default function DocumentTypesRestorePage() {
  const qc = useQueryClient()

  // fetch deleted (soft) items
  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ['docTypes-restore', DEPT_ID],
    queryFn: () => listDeletedDocumentTypesByDepartment(DEPT_ID),
  })

  const restoreMut = useMutation({
    mutationFn: (id: number) => restoreDocumentType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['docTypes-restore', DEPT_ID] }),
  })

  const hardDelMut = useMutation({
    mutationFn: (id: number) => deleteDocumentTypeHard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['docTypes-restore', DEPT_ID] }),
  })

  const onRestore = (id?: number) => {
    if (!id) return
    if (confirm('Restore this document type?')) restoreMut.mutate(id)
  }

  const onHardDelete = (id?: number, name?: string) => {
    if (!id) return
    if (confirm(`Delete permanently "${name}"? This cannot be undone.`)) {
      hardDelMut.mutate(id)
    }
  }

  return (
    <div className="p-6 text-gray-100">
      <h1 className="text-xl font-semibold mb-4">Restore Document Types</h1>

      <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
        <div className="p-3 text-sm text-gray-400">
          {isLoading && 'Loading…'}
          {error && 'Failed to load.'}
          {!isLoading && !error && rows.length === 0 && 'No deleted items.'}
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Export</th>
                  <th className="px-4 py-2 text-left">Format</th>
                  <th className="px-4 py-2 text-left">Color</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {rows.map((d: DocumentTypeDTO, i: number) => (
                  <tr key={d.id}>
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{d.name}</td>
                    <td className="px-4 py-2">{d.exportType}</td>
                    <td className="px-4 py-2">{d.exportFormat}</td>
                    <td className="px-4 py-2">{d.colorFormat}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700"
                        disabled={restoreMut.isPending}
                        onClick={() => onRestore(d.id)}
                      >
                        {restoreMut.isPending ? 'Restoring…' : 'Restore'}
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                        disabled={hardDelMut.isPending}
                        onClick={() => onHardDelete(d.id, d.name)}
                      >
                        {hardDelMut.isPending ? 'Deleting…' : 'Delete Permanently'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
