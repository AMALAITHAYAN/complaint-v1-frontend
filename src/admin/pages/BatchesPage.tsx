import * as React from "react";
import {
  listBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  listActiveDocTypes,
  BatchCreateUpdateRequest,
  WorkflowStep,
  SeparationMethod,
  DocTypeBrief,
} from "@/admin/api/batches";

const WF_STEPS: { key: WorkflowStep; label: string; svg: JSX.Element }[] = [
  {
    key: "SCAN",
    label: "SCAN",
    svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
        <path d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"/>
        <path d="M21 5H3M7 5V3a2 2 0 012-2h6a2 2 0 012 2v2"/>
      </svg>
    ),
  },
  {
    key: "INDEX",
    label: "INDEX",
    svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    ),
  },
  {
    key: "QUALITY",
    label: "QUALITY",
    svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
        <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
        <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
      </svg>
    ),
  },
  {
    key: "EXPORT",
    label: "EXPORT",
    svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
];

const SEP_METHODS: { key: SeparationMethod; label: string }[] = [
  { key: "NONE", label: "No Separation" },
  { key: "DOCUMENT_SEPARATORS", label: "Document Separators" },
  { key: "NUMBER_OF_PAGES", label: "Number Of Pages" },
];

type SidebarBatch = { id: number; name: string; departmentName?: string | null };

export default function BatchesPage() {
  // sidebar state
  const [rows, setRows] = React.useState<SidebarBatch[]>([]);
  const [query, setQuery] = React.useState("");
  const [loadingList, setLoadingList] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // lookups
  const [docTypes, setDocTypes] = React.useState<DocTypeBrief[]>([]);

  // optional future: fields from selected document types (for dynamic chips)
  const [fields] = React.useState<{ name: string; displayName?: string }[]>([]);

  // form state
  const [form, setForm] = React.useState<BatchCreateUpdateRequest>({
    departmentName: "",
    name: "",
    namingFormula: "",
    expectedScanTimeSec: 1,
    workflow: ["SCAN", "INDEX", "QUALITY", "EXPORT"],
    separation: { method: "NONE", info: "" },
    qualityPercentage: 100,
    autoImportPath: "",
    autoProcessImported: false,
    selectedDocumentTypeIds: [],
  });

  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    refreshList();
    listActiveDocTypes().then(setDocTypes).catch(console.error);
  }, []);

  async function refreshList() {
    setLoadingList(true);
    try {
      const page = await listBatches({ page: 1, size: 200, q: query || undefined });
      setRows(page.items);
    } finally {
      setLoadingList(false);
    }
  }

  async function loadFromRow(id: number) {
    setSelectedId(id);
    const dto = await getBatch(id);
    setForm({
      departmentName: dto.departmentName ?? "",
      name: dto.name,
      namingFormula: dto.namingFormula ?? "",
      expectedScanTimeSec: dto.expectedScanTimeSec ?? 1,
      workflow: dto.workflow,
      separation: { method: dto.separationMethod as SeparationMethod, info: dto.separationInfo ?? "" },
      qualityPercentage: dto.qualityPercentage ?? 100,
      autoImportPath: dto.autoImportPath ?? "",
      autoProcessImported: !!dto.autoProcessImported,
      selectedDocumentTypeIds: dto.selectedDocumentTypes.map(x => x.id),
    });
  }

  function resetForm() {
    setSelectedId(null);
    setForm({
      departmentName: "",
      name: "",
      namingFormula: "",
      expectedScanTimeSec: 1,
      workflow: ["SCAN", "INDEX", "QUALITY", "EXPORT"],
      separation: { method: "NONE", info: "" },
      qualityPercentage: 100,
      autoImportPath: "",
      autoProcessImported: false,
      selectedDocumentTypeIds: [],
    });
  }

  async function onSave() {
    setSaving(true);
    try {
      if (!form.name.trim()) {
        alert("Batch Name is required");
        return;
      }
      if (selectedId == null) {
        await createBatch(form);
        alert("Batch created");
      } else {
        await updateBatch(selectedId, form);
        alert("Batch updated");
      }
      resetForm();
      await refreshList();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (selectedId == null) return;
    if (!confirm("Delete this batch?")) return;
    setDeleting(true);
    try {
      await deleteBatch(selectedId);
      alert("Batch deleted");
      resetForm();
      await refreshList();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const toggleWorkflow = (step: WorkflowStep) => {
    setForm(f => {
      const has = f.workflow.includes(step);
      return { ...f, workflow: has ? f.workflow.filter(s => s !== step) : [...f.workflow, step] };
    });
  };

  const toggleDocType = (id: number) => {
    setForm(f => {
      const has = f.selectedDocumentTypeIds.includes(id);
      return {
        ...f,
        selectedDocumentTypeIds: has
          ? f.selectedDocumentTypeIds.filter(x => x !== id)
          : [...f.selectedDocumentTypeIds, id],
      };
    });
  };

  // ======= Formula insertion helpers =======
  const namingRef = React.useRef<HTMLInputElement>(null);

  const insertToken = (token: string) => {
    setForm(f => {
      const el = namingRef.current;
      if (!el) return { ...f, namingFormula: (f.namingFormula ?? "") + token };
      const start = el.selectionStart ?? (f.namingFormula?.length ?? 0);
      const end = el.selectionEnd ?? start;
      const base = f.namingFormula ?? "";
      const next = base.slice(0, start) + token + base.slice(end);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + token.length;
        el.setSelectionRange(pos, pos);
      });
      return { ...f, namingFormula: next };
    });
  };

  // small icon button used inside the input adornment
  const inlineIcon = (label: string, onClick: () => void, icon: JSX.Element) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="h-9 w-9 shrink-0 grid place-items-center rounded-md border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-750 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      {icon}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* LEFT: sidebar */}
      <aside className="w-80 bg-slate-900/80 border-r border-slate-800 flex flex-col backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="p-6 border-b border-slate-800">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm placeholder-slate-500 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search batches..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshList}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Refresh
            </button>
            <button
              onClick={resetForm}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Batch
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loadingList ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400">
              <div className="animate-spin h-8 w-8 border-2 border-slate-700 border-t-indigo-500 rounded-full mb-4"></div>
              <p className="text-sm">Loading batches...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-500">
              <svg className="h-12 w-12 mb-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <p className="text-sm">No batches found</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {rows.map(row => (
                <div
                  key={row.id}
                  onClick={() => loadFromRow(row.id)}
                  className={`cursor-pointer p-4 rounded-lg border transition-all duration-150 ${
                    selectedId === row.id
                      ? "border-indigo-500/40 bg-indigo-500/10 shadow-sm"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:shadow-sm"
                  }`}
                >
                  <div className="font-medium text-slate-100 text-sm">{row.name}</div>
                  {row.departmentName && (
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                        <path d="M16 3.13a4 4 0 010 7.75"/>
                      </svg>
                      {row.departmentName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onDelete}
            disabled={!selectedId || deleting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-lg hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Deleting...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
                Delete Batch
              </>
            )}
          </button>
        </div>
      </aside>

      {/* RIGHT: main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <svg className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Batch Management
                {selectedId && <span className="text-lg font-normal text-slate-400">· Editing Batch #{selectedId}</span>}
              </h1>
              <p className="text-slate-400">Configure and manage document processing batches</p>
            </div>
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* GENERAL + SEPARATION */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-10 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-12 gap-10">
              {/* GENERAL */}
              <div className="col-span-12 lg:col-span-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-500/15 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-100">General Settings</h2>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  {/* Batch Name */}
                  <div className="col-span-12 lg:col-span-8">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Batch Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="block w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., HR Documents"
                    />
                  </div>

                  {/* Expected Scan Time */}
                  <div className="col-span-12 lg:col-span-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Expected Scan Time</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={form.expectedScanTimeSec ?? 1}
                        onChange={e =>
                          setForm({
                            ...form,
                            expectedScanTimeSec: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="block w-full px-3 py-2 pr-12 rounded-lg text-sm bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 text-sm">sec</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Approx: 60 pages/min • 25,200 pages/7hrs</p>
                  </div>

                  {/* Naming Formula — single control with inline icons */}
                  <div className="col-span-12">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Naming Formula</label>
                    <div className="relative">
                      <input
                        ref={namingRef}
                        value={form.namingFormula ?? ""}
                        onChange={e => setForm({ ...form, namingFormula: e.target.value })}
                        className="w-full pl-4 pr-[11.5rem] h-11 rounded-lg text-sm bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="HR{CAP_DEFAULT:DATETIME}"
                      />
                      {/* right adornment action group */}
                      <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                        {inlineIcon(
                          "Date Time",
                          () => insertToken("{CAP_DEFAULT:DATETIME}"),
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                          </svg>
                        )}
                        {inlineIcon(
                          "Date",
                          () => insertToken("{CAP_DEFAULT:DATE}"),
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        )}
                        {inlineIcon(
                          "Random ID",
                          () => insertToken("{CAP_RANDOM}"),
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10"/>
                            <polyline points="1 20 1 14 7 14"/>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    {/* removed the second row of chips/buttons to avoid confusion */}
                  </div>

                  {/* WORKFLOW */}
                  <div className="col-span-12 mt-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center">
                        <svg className="h-5 w-5 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-100">Workflow Steps</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {WF_STEPS.map(({ key, label, svg }, index) => {
                        const active = form.workflow.includes(key);
                        return (
                          <div key={key} className="relative">
                            <button
                              type="button"
                              onClick={() => toggleWorkflow(key)}
                              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                                active
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                                  : "border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                {svg}
                                <span className="text-xs font-medium">{label}</span>
                              </div>
                              {active && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center shadow">
                                  <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20,6 9,17 4,12"/>
                                  </svg>
                                </div>
                              )}
                            </button>
                            {index < WF_STEPS.length - 1 && (
                              <div className="hidden sm:block absolute top-1/2 -right-2 w-4 h-px bg-slate-700/60 transform -translate-y-1/2"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEPARATION */}
              <div className="col-span-12 lg:col-span-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/30 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">Document Separation</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Separation Method</label>
                    <div className="space-y-3">
                      {SEP_METHODS.map(({ key, label }) => (
                        <label
                          key={key}
                          className={`relative flex items-start p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                            form.separation.method === key
                              ? "border-amber-500/40 bg-amber-500/10"
                              : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-850"
                          }`}
                        >
                          <input
                            type="radio"
                            name="sep"
                            checked={form.separation.method === key}
                            onChange={() => setForm({ ...form, separation: { ...form.separation, method: key } })}
                            className="h-4 w-4 text-amber-400 bg-slate-800 border-slate-700 focus:ring-amber-400 mt-0.5"
                          />
                          <span className="ml-3 text-sm font-medium text-slate-200">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Additional Information</label>
                    <input
                      value={form.separation.info ?? ""}
                      onChange={e => setForm({ ...form, separation: { ...form.separation, info: e.target.value } })}
                      className="block w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Additional separation details"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENT TYPES + QUALITY + AUTO IMPORT */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-12 gap-10">
              {/* Document types */}
              <div className="col-span-12 lg:col-span-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">Document Types</h3>
                </div>
                <div className="space-y-3 max-h-80 overflow-auto pr-1">
                  {docTypes.map(dt => {
                    const checked = form.selectedDocumentTypeIds.includes(dt.id);
                    return (
                      <label
                        key={dt.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                          checked
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDocType(dt.id)}
                          className="h-4 w-4 text-emerald-400 bg-slate-800 border-slate-700 rounded focus:ring-emerald-400"
                        />
                        <span className={`text-sm font-medium ${checked ? "text-emerald-100" : "text-slate-200"}`}>
                          {dt.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quality */}
              <div className="col-span-12 lg:col-span-3">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-500/15 border border-yellow-500/30 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">Quality Control</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quality Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.qualityPercentage ?? 100}
                      onChange={e =>
                        setForm({ ...form, qualityPercentage: e.target.value ? Number(e.target.value) : undefined })
                      }
                      className="block w-full px-3 py-2 pr-8 rounded-lg text-sm bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto import */}
              <div className="col-span-12 lg:col-span-3">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-sky-500/15 border border-sky-500/30 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">Auto Import</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Import Path</label>
                    <input
                      value={form.autoImportPath ?? ""}
                      onChange={e => setForm({ ...form, autoImportPath: e.target.value })}
                      className="block w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      placeholder="\\\\server\\share\\inbox"
                    />
                  </div>
                  <div className="relative">
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-850 cursor-pointer transition-all duration-150">
                      <input
                        type="checkbox"
                        checked={!!form.autoProcessImported}
                        onChange={e => setForm({ ...form, autoProcessImported: e.target.checked })}
                        className="h-4 w-4 text-sky-400 bg-slate-800 border-slate-700 rounded focus:ring-sky-400 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-200">Auto Process Documents</span>
                        <p className="text-xs text-slate-500 mt-1">Automatically process documents when imported</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-6" />
        </div>
      </main>
    </div>
  );
}
