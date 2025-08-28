// src/admin/pages/DocumentTypesPage.tsx
import React, { useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Trash2,
  Plus,
  X,
  GripVertical,
  Pencil,
  FileText,
  Folder,
  Square,           // ✅ safe icon
  Timer,
  Search as SearchIcon,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import {
  createDocumentType,
  updateDocumentType,
  listDocumentTypesByDepartment,
  softDeleteDocumentType,
  DocumentTypeDTO,
  IndexingFieldDTO,
  ColorFormat,
  ExportFormat,
} from '@/admin/api/documentTypes'

type FieldType = 'text' | 'date' | 'number' | 'options'
const DEPT_ID = 1

// Small UI bits
const Switch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label?: string
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`inline-flex items-center h-6 w-11 rounded-full transition ${
      checked ? 'bg-blue-600' : 'bg-gray-600'
    }`}
    aria-checked={checked}
    role="switch"
  >
    <span
      className={`h-5 w-5 bg-white rounded-full shadow transform transition ${
        checked ? 'translate-x-5' : 'translate-x-1'
      }`}
    />
    {label && <span className="ml-2 text-sm text-gray-300">{label}</span>}
  </button>
)

const Chip = ({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'violet' | 'pink' }) => {
  const tones =
    tone === 'violet'
      ? 'bg-violet-900/40 text-violet-200 border-violet-700'
      : tone === 'pink'
      ? 'bg-pink-900/40 text-pink-200 border-pink-700'
      : 'bg-slate-800 text-slate-200 border-slate-600'
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${tones}`}>{children}</span>
}

export default function DocumentTypesPage() {
  const qc = useQueryClient()

  // ------- LIST -------
  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ['docTypes', DEPT_ID],
    queryFn: () => listDocumentTypesByDepartment(DEPT_ID),
  })

  // ------- LEFT SIDEBAR STATE -------
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name?.toLowerCase().includes(q))
  }, [rows, search])

  // ------- EDIT MODE (WHOLE DOC TYPE) -------
  const [editId, setEditId] = useState<number | null>(null)

  // ------- GENERAL -------
  const [name, setName] = useState('')
  const [avgIndex, setAvgIndex] = useState<number | ''>('')
  const [avgQuality, setAvgQuality] = useState<number | ''>('')

  // ------- FORMULAS -------
  const [folderTpl, setFolderTpl] = useState('')
  const [fileTpl, setFileTpl] = useState('')

  // ------- EXPORT -------
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF')
  const [colorFormat, setColorFormat] = useState<ColorFormat>('MEDIUM_8')

  // ------- FIELDS BUILDER -------
  type Field = {
    name: string
    displayName: string
    type: FieldType
    defaultValue?: string
    visible: boolean
    required: boolean
    unique: boolean
    lookup?: boolean
    options?: string[]
  }

  const blankField: Field = {
    name: '',
    displayName: '',
    type: 'text',
    defaultValue: '',
    visible: true,
    required: false,
    unique: false,
    lookup: false,
    options: [],
  }

  const [fieldDraft, setFieldDraft] = useState<Field>({ ...blankField })
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [optionInput, setOptionInput] = useState('')
  const [fields, setFields] = useState<Field[]>([])

  // --- Options for "options" field type
  const addOption = () => {
    if (!optionInput.trim()) return
    setFieldDraft((f) => ({ ...f, options: [...(f.options || []), optionInput.trim()] }))
    setOptionInput('')
  }
  const removeOption = (i: number) =>
    setFieldDraft((f) => ({ ...f, options: f.options?.filter((_, idx) => idx !== i) || [] }))

  // --- Add / Update Field
  const saveFieldDraft = () => {
    if (!fieldDraft.name.trim() || !fieldDraft.displayName.trim()) return
    if (editingFieldIndex === null) {
      setFields((arr) => [...arr, { ...fieldDraft }])
    } else {
      setFields((arr) => arr.map((it, idx) => (idx === editingFieldIndex ? { ...fieldDraft } : it)))
    }
    setFieldDraft({ ...blankField })
    setEditingFieldIndex(null)
    setOptionInput('')
    toast.success(editingFieldIndex === null ? 'Field added' : 'Field updated')
  }
  const editField = (i: number) => {
    setFieldDraft({ ...fields[i] })
    setEditingFieldIndex(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const removeField = (i: number) => {
    setFields((arr) => arr.filter((_, idx) => idx !== i))
    if (editingFieldIndex === i) {
      setFieldDraft({ ...blankField })
      setEditingFieldIndex(null)
    }
  }

  // --- Toggle helpers for field row switches
  const toggleFieldProp = (idx: number, key: keyof Field) =>
    setFields((arr) => arr.map((f, i) => (i === idx ? { ...f, [key]: !f[key] } : f)))

  // --- Drag & drop reordering
  const dragFrom = useRef<number | null>(null)
  const onDragStart = (i: number, e: React.DragEvent) => {
    dragFrom.current = i
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(i))
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const onDrop = (toIndex: number, e: React.DragEvent) => {
    e.preventDefault()
    const fromIndex = dragFrom.current ?? Number(e.dataTransfer.getData('text/plain'))
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) return
    setFields((arr) => {
      const copy = [...arr]
      const [moved] = copy.splice(fromIndex, 1)
      copy.splice(toIndex, 0, moved)
      return copy
    })
    dragFrom.current = null
    toast.success('Field order updated')
  }

  // Prefill form from a selected row
  function loadFromRow(d: DocumentTypeDTO) {
    setSelectedId(d.id ?? null)
    setEditId(d.id ?? null)
    setName(d.name || '')
    setAvgIndex(d.avgIndexTime ?? '')
    setAvgQuality(d.avgQualityTime ?? '')
    setFolderTpl(d.folderTemplate || '')
    setFileTpl(d.fileTemplate || '')
    setExportFormat(d.exportFormat)
    setColorFormat(d.colorFormat)
    setFields(
      (d.indexingFields || []).map((f) => ({
        name: f.name,
        displayName: f.displayName,
        type: f.type as FieldType,
        defaultValue: f.defaultValue || '',
        visible: f.visible,
        required: f.required,
        unique: f.unique,
        lookup: !!f.lookup,
        options: f.options || [],
      }))
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Chips for formula
  const formulaTokens = useMemo(
    () => [
      { key: 'Document Type', token: '{CAP_Document Type}' },
      ...fields.map((f) => ({ key: f.displayName || f.name, token: `{CAP_${f.displayName || f.name}}` })),
      { key: 'Default DateTime', token: '{CAP_DEFAULT:DATETIME}' },
      { key: 'Default Date', token: '{CAP_DEFAULT:DATE}' },
      { key: 'Random Id', token: '{CAP_RANDOM}' },
    ],
    [fields]
  )
  const appendToken = (setter: (v: string) => void, token: string) =>
    setter((v) => (v ? `${v}${token}` : token))

  // ------- MUTATIONS -------
  const createMut = useMutation({
    mutationFn: (payload: DocumentTypeDTO) => createDocumentType(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['docTypes', DEPT_ID] })
      resetForm()
      toast.success('Document type created')
    },
    onError: () => toast.error('Failed to create'),
  })

  const updateMut = useMutation({
    mutationFn: (payload: DocumentTypeDTO) => updateDocumentType(editId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['docTypes', DEPT_ID] })
      setEditId(null)
      resetForm()
      toast.success('Updated successfully')
    },
    onError: () => toast.error('Update failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => softDeleteDocumentType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['docTypes', DEPT_ID] })
      if (selectedId) {
        if (selectedId === editId) {
          setEditId(null)
          resetForm()
        }
        setSelectedId(null)
      }
      toast.success('Moved to recycle bin')
    },
    onError: () => toast.error('Delete failed'),
  })

  function resetForm() {
    setName('')
    setAvgIndex('')
    setAvgQuality('')
    setFields([])
    setFolderTpl('')
    setFileTpl('')
    setExportFormat('PDF')
    setColorFormat('MEDIUM_8')
  }

  const submit = () => {
    if (!name.trim() || fields.length === 0) {
      toast.error('Name and at least one field are required')
      return
    }

    const indexingFields: IndexingFieldDTO[] = fields.map((f) => ({
      name: f.name.trim(),
      displayName: f.displayName.trim(),
      type: f.type as any,
      required: f.required,
      visible: f.visible,
      unique: f.unique,
      defaultValue: f.defaultValue || null,
      options: f.type === 'options' ? f.options : [],
      lookup: !!f.lookup,
    }))

    const payload: DocumentTypeDTO = {
      departmentId: DEPT_ID,
      name: name.trim(),
      avgIndexTime: avgIndex === '' ? null : Number(avgIndex),
      avgQualityTime: avgQuality === '' ? null : Number(avgQuality),
      indexingFields,
      folderTemplate: folderTpl || null,
      fileTemplate: fileTpl || null,
      exportType: 'FILESYSTEM',
      exportFormat,
      colorFormat,
    }

    if (editId) updateMut.mutate(payload)
    else createMut.mutate(payload)
  }

  const handleDeleteSelected = () => {
    if (!selectedId) return
    if (confirm('Soft delete the selected document type?')) deleteMut.mutate(selectedId)
  }
  const handleDeleteInline = (id?: number) => {
    if (!id) return
    if (confirm('Soft delete this document type?')) deleteMut.mutate(id)
  }

  // --------- UI ---------
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Toaster position="top-right" />
      <div className="flex">
        {/* LEFT: list */}
        <aside className="w-[320px] bg-gray-900 border-r border-gray-800">
          <div className="p-4">
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-3">
              <SearchIcon size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search document types…"
                className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-400 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-auto pr-1">
              {isLoading && <div className="p-3 text-sm text-gray-400">Loading…</div>}
              {!!error && <div className="p-3 text-sm text-red-400">Failed to load</div>}
              {!isLoading && !filteredRows.length && (
                <div className="p-3 text-gray-500 text-sm">No document types yet</div>
              )}

              {filteredRows.map((d) => {
                const active = selectedId === d.id
                return (
                  <div
                    key={d.id}
                    className={`group rounded-lg border ${active ? 'border-blue-600' : 'border-gray-800'} bg-gray-800/60 hover:bg-gray-800 transition`}
                  >
                    <button
                      onClick={() => {
                        setSelectedId(d.id ?? null)
                        loadFromRow(d)
                      }}
                      className="w-full text-left p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <FileText size={18} className="text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium leading-5 text-gray-100">{d.name}</div>
                          <div className="flex items-center gap-2 pt-1">
                            <Chip tone="violet">{d.exportFormat}</Chip>
                            <Chip tone="pink">{d.colorFormat}</Chip>
                          </div>
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center justify-end gap-1 px-2 pb-2">
                      <button
                        className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200"
                        title="Edit"
                        onClick={() => loadFromRow(d)}
                        type="button"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                        title="Soft delete"
                        onClick={() => handleDeleteInline(d.id)}
                        disabled={deleteMut.isPending}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
              onClick={handleDeleteSelected}
              disabled={!selectedId || deleteMut.isPending}
              type="button"
            >
              <Trash2 size={16} />
              Discard Selected
            </button>
          </div>
        </aside>

        {/* RIGHT: form */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* HEADER */}
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Folder size={18} className="text-blue-300" />
                <h1 className="text-xl font-semibold">
                  Document Type {editId && <span className="text-sm text-blue-400"> (Editing #{editId})</span>}
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
                <span className="inline-flex items-center gap-2">
                  <Timer size={16} /> Index {avgIndex || '-'}m
                </span>
                <span className="inline-flex items-center gap-2">
                 <Square size={16} /> {exportFormat} / {colorFormat}
                </span>
              </div>
            </header>

            {/* GENERAL */}
            <section>
              <div className="bg-gray-900/70 p-6 rounded-lg border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Document Type Name</label>
                    <input
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Passport#"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Average Indexing Time (min)</label>
                    <input
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                      type="number"
                      min={0}
                      value={avgIndex}
                      onChange={(e) => setAvgIndex(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Average Quality Time (min)</label>
                    <input
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                      type="number"
                      min={0}
                      value={avgQuality}
                      onChange={(e) => setAvgQuality(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* FIELDS */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Fields</h2>

              {/* Draft editor */}
              <div className="bg-gray-900/70 p-6 rounded-lg border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                      value={fieldDraft.name}
                      onChange={(e) => setFieldDraft({ ...fieldDraft, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                    <input
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                      value={fieldDraft.displayName}
                      onChange={(e) => setFieldDraft({ ...fieldDraft, displayName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                      value={fieldDraft.type}
                      onChange={(e) =>
                        setFieldDraft({ ...fieldDraft, type: e.target.value as FieldType, options: [] })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                      <option value="options">Options</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Value</label>
                    <input
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                      value={fieldDraft.defaultValue}
                      onChange={(e) => setFieldDraft({ ...fieldDraft, defaultValue: e.target.value })}
                    />
                  </div>
                </div>

                {fieldDraft.type === 'options' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Add Option</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        placeholder="Enter option"
                      />
                      <button
                        onClick={addOption}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                        type="button"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {!!fieldDraft.options?.length && (
                      <div className="flex flex-wrap gap-2">
                        {fieldDraft.options!.map((option, index) => (
                          <span
                            key={index}
                            className="bg-gray-800 border border-gray-700 text-gray-100 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                          >
                            {option}
                            <button onClick={() => removeOption(index)} className="text-gray-400 hover:text-red-400">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">Visible</span>
                      <Switch
                        checked={fieldDraft.visible}
                        onChange={(v) => setFieldDraft({ ...fieldDraft, visible: v })}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">Required</span>
                      <Switch
                        checked={fieldDraft.required}
                        onChange={(v) => setFieldDraft({ ...fieldDraft, required: v })}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">Unique</span>
                      <Switch
                        checked={fieldDraft.unique}
                        onChange={(v) => setFieldDraft({ ...fieldDraft, unique: v })}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">Lookup</span>
                      <Switch
                        checked={!!fieldDraft.lookup}
                        onChange={(v) => setFieldDraft({ ...fieldDraft, lookup: v })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingFieldIndex !== null && (
                      <button
                        onClick={() => {
                          setFieldDraft({ ...blankField })
                          setEditingFieldIndex(null)
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800"
                        type="button"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={saveFieldDraft}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                      disabled={!fieldDraft.name.trim() || !fieldDraft.displayName.trim()}
                      type="button"
                    >
                      {editingFieldIndex === null ? 'Add Field' : 'Update Field'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Fields table with re-order, toggles, inline edit */}
              {fields.length > 0 && (
                <div className="bg-gray-900/70 rounded-lg border border-gray-800 overflow-hidden mt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px]">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Order</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Display Name</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Default</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Visible</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Required</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Unique</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Lookup</th>
                          <th className="px-3 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {fields.map((f, i) => (
                          <tr key={`${f.name}-${i}`} className="hover:bg-gray-900">
                            <td
                              className="px-3 py-2 cursor-grab select-none"
                              draggable
                              onDragStart={(e) => onDragStart(i, e)}
                              onDragOver={onDragOver}
                              onDrop={(e) => onDrop(i, e)}
                              title="Drag to reorder"
                            >
                              <GripVertical size={16} className="text-gray-400" />
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-300">{f.name}</td>
                            <td className="px-3 py-2 text-sm text-blue-300">{f.displayName}</td>
                            <td className="px-3 py-2 text-sm text-gray-300 capitalize">{f.type}</td>
                            <td className="px-3 py-2 text-sm text-gray-300">{f.defaultValue || '-'}</td>
                            <td className="px-3 py-2">
                              <Switch checked={!!f.visible} onChange={() => toggleFieldProp(i, 'visible')} />
                            </td>
                            <td className="px-3 py-2">
                              <Switch checked={!!f.required} onChange={() => toggleFieldProp(i, 'required')} />
                            </td>
                            <td className="px-3 py-2">
                              <Switch checked={!!f.unique} onChange={() => toggleFieldProp(i, 'unique')} />
                            </td>
                            <td className="px-3 py-2">
                              <Switch checked={!!f.lookup} onChange={() => toggleFieldProp(i, 'lookup')} />
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => editField(i)}
                                  className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800"
                                  type="button"
                                  title="Edit field"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => removeField(i)}
                                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                  type="button"
                                  title="Remove field"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* FORMULAS */}
            <section>
              <div className="bg-gray-900/70 p-6 rounded-lg border border-gray-800 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Folder Formula</h3>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {formulaTokens.map((t) => (
                      <button
                        key={t.token}
                        className="px-3 py-1 text-xs rounded-full bg-pink-900/30 border border-pink-700 text-pink-200 hover:bg-pink-900/40"
                        onClick={() => appendToken(setFolderTpl, t.token)}
                        type="button"
                      >
                        {t.key}
                      </button>
                    ))}
                  </div>
                  <input
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                    value={folderTpl}
                    onChange={(e) => setFolderTpl(e.target.value)}
                    placeholder="Folder naming template"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">File Formula</h3>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {formulaTokens.map((t) => (
                      <button
                        key={t.token + '_file'}
                        className="px-3 py-1 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                        onClick={() => appendToken(setFileTpl, t.token)}
                        type="button"
                      >
                        {t.key}
                      </button>
                    ))}
                  </div>
                  <input
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                    value={fileTpl}
                    onChange={(e) => setFileTpl(e.target.value)}
                    placeholder="File naming template"
                  />
                </div>
              </div>
            </section>

            {/* EXPORT */}
            <section>
              <div className="bg-gray-900/70 p-6 rounded-lg border border-gray-800 space-y-6">
                <h3 className="text-lg font-semibold">Export</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Export Format</label>
                  <div className="flex flex-wrap gap-6">
                    {(['PDF', 'PDFA', 'TIFF', 'AS_IMPORTED'] as const).map((f) => (
                      <label key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="radio"
                          name="exportFormat"
                          value={f}
                          checked={exportFormat === f}
                          onChange={() => setExportFormat(f)}
                          className="w-4 h-4"
                        />
                        {f === 'AS_IMPORTED' ? 'As imported' : f}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Export Compression</label>
                  <div className="flex flex-wrap gap-6">
                    {(['HIGH_16', 'MEDIUM_8', 'GRAYSCALE'] as const).map((c) => (
                      <label key={c} className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="radio"
                          name="colorFormat"
                          value={c}
                          checked={colorFormat === c}
                          onChange={() => setColorFormat(c)}
                          className="w-4 h-4"
                        />
                        {c === 'HIGH_16' ? 'High / 16 bit' : c === 'MEDIUM_8' ? 'Medium / 8 bit' : 'Grayscale'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ACTIONS */}
            <section>
              <div className="flex items-center justify-end gap-3">
                {editId && (
                  <button
                    onClick={() => {
                      setEditId(null)
                      resetForm()
                      setSelectedId(null)
                    }}
                    className="px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-900"
                    type="button"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={submit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50"
                  disabled={(editId ? updateMut.isPending : createMut.isPending) || !name.trim() || fields.length === 0}
                  type="button"
                >
                  {editId ? (updateMut.isPending ? 'Updating…' : 'Update') : (createMut.isPending ? 'Saving…' : 'Save')}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
