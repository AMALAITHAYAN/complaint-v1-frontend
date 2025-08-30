import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  listGroups, getGroup, createGroup, updateGroup, deleteGroup,
  listAllBatchesAsPermissions,
  listUsers, getUser, createUser, updateUser,
  type GroupDTO, type BatchPermissionDTO, type UserDTO
} from "../api/access";
import {
  Users, UserPlus, Search, FolderKanban, ScanLine, ListChecks, CheckCircle2,
  Pencil, Trash2, Save, X, Plus, Shield, BadgeCheck
} from "lucide-react";

// ---------- tiny UI helpers ----------
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      {props["data-icon"] && (
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          {props["data-icon"] as any}
        </span>
      )}
      <input
        {...props}
        className={
          "w-full rounded-lg bg-gray-800/60 border border-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
          (props["data-icon"] ? "pl-9 " : "") +
          (props.className || "")
        }
      />
    </div>
  );
}
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full transition ${
        checked ? "bg-indigo-500" : "bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}`}
      aria-pressed={checked}
      aria-label="toggle"
    >
      <span
        className={`block h-5 w-5 bg-white rounded-full transform transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3 py-2 text-sm font-medium text-white shadow-sm " +
        (props.className || "")
      }
    />
  );
}
function MutedButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center gap-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-3 py-2 text-sm font-medium text-gray-100 " +
        (props.className || "")
      }
    />
  );
}
function DangerButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 px-3 py-2 text-sm font-medium text-white " +
        (props.className || "")
      }
    />
  );
}

// ---------------------------
// Route
// ---------------------------
export const Route = createFileRoute("/admin/users-access")({
  component: UsersAccessPage,
});

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-2 rounded-lg inline-flex items-center gap-2 border ${
        active
          ? "bg-indigo-600 text-white border-indigo-500"
          : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700/80"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  extra,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-indigo-400">{icon}</div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {extra}
    </div>
  );
}

function UsersAccessPage() {
  const [activeTab, setActiveTab] = useState<"groups" | "users">("groups");
  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/60">
          <div className="flex items-center gap-3">
            <TabButton
              active={activeTab === "groups"}
              onClick={() => setActiveTab("groups")}
              icon={<BadgeCheck className="w-4 h-4" />}
              label="Groups"
            />
            <TabButton
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
              icon={<Users className="w-4 h-4" />}
              label="Users"
            />
          </div>
        </div>
        {activeTab === "groups" ? <GroupsTab /> : <UsersTab />}
      </div>
    </div>
  );
}

// ---------------------------
// Groups Tab
// ---------------------------
function GroupsTab() {
  const [q, setQ] = useState("");
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const p = await listGroups({ q });
      setGroups(p.content);
      if (p.content.length > 0 && !selectedId) {
        setSelectedId(p.content[0].id);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [q]);

  return (
    <div className="flex flex-1">
      {/* Left list */}
      <div className="w-80 border-r border-gray-800 bg-gray-900/40 p-3 space-y-3">
        <TextInput
          placeholder="Search groups..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          data-icon={<Search className="w-4 h-4" />}
        />
        <div
          className="space-y-1 overflow-auto"
          style={{ maxHeight: "calc(100vh - 190px)" }}
        >
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              className={`w-full text-left px-3 py-2 rounded-lg border ${
                selectedId === g.id
                  ? "bg-gray-700 text-white border-gray-600"
                  : "hover:bg-gray-800 text-gray-200 border-transparent"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                {g.name}
              </span>
            </button>
          ))}
          {groups.length === 0 && (
            <div className="text-xs text-gray-500">No groups</div>
          )}
        </div>
        <PrimaryButton onClick={() => setSelectedId(-1)}>
          <Plus className="w-4 h-4" /> New Group
        </PrimaryButton>
      </div>

      {/* Right panel */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedId === -1 ? (
          <GroupEditor
            onSaved={(g) => {
              setSelectedId(g.id);
              refresh();
            }}
          />
        ) : selectedId ? (
          <GroupDetails
            id={selectedId}
            onDeleted={() => {
              setSelectedId(undefined);
              refresh();
            }}
          />
        ) : (
          <div className="text-gray-400">Select a group to view details</div>
        )}
      </div>
    </div>
  );
}

function GroupEditor({
  id,
  onSaved,
}: {
  id?: number;
  onSaved: (g: GroupDTO) => void;
}) {
  const [name, setName] = useState("");
  const [rows, setRows] = useState<BatchPermissionDTO[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const base = await listAllBatchesAsPermissions();
      setRows(base);
    })();
  }, []);

  async function save() {
    setBusy(true);
    try {
      const payload = {
        name,
        batchPermissions: rows.filter((r) => r.scan || r.index || r.quality),
      };
      const res = await createGroup(payload);
      onSaved(res);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <SectionHeader
        icon={<Users className="w-6 h-6" />}
        title="New Group"
        subtitle="Name the group and toggle allowed steps per batch."
      />

      <div className="grid gap-2 max-w-lg">
        <label className="text-sm text-gray-300">Group Name</label>
        <TextInput
          placeholder="Enter group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 text-[11px] uppercase tracking-wide bg-gray-800 text-gray-300 px-4 py-2">
          <div className="inline-flex items-center gap-2">
            <FolderKanban className="w-4 h-4" /> Batch
          </div>
          <div className="text-center inline-flex items-center justify-center gap-1">
            <ScanLine className="w-4 h-4" /> Scan
          </div>
          <div className="text-center inline-flex items-center justify-center gap-1">
            <ListChecks className="w-4 h-4" /> Index
          </div>
          <div className="text-center inline-flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Quality
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {rows.map((r, idx) => (
            <div
              key={r.batchId}
              className="grid grid-cols-4 items-center px-4 py-2 hover:bg-gray-900"
            >
              <div className="text-gray-200 text-sm">
                {r.batchName ?? r.batchId}
              </div>
              <div className="flex justify-center">
                <Toggle
                  checked={r.scan}
                  onChange={(v) => {
                    const n = [...rows];
                    n[idx] = { ...r, scan: v };
                    setRows(n);
                  }}
                />
              </div>
              <div className="flex justify-center">
                <Toggle
                  checked={r.index}
                  onChange={(v) => {
                    const n = [...rows];
                    n[idx] = { ...r, index: v };
                    setRows(n);
                  }}
                />
              </div>
              <div className="flex justify-center">
                <Toggle
                  checked={r.quality}
                  onChange={(v) => {
                    const n = [...rows];
                    n[idx] = { ...r, quality: v };
                    setRows(n);
                  }}
                />
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-sm text-gray-500 p-4">
              No batches configured yet.
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <PrimaryButton onClick={save} disabled={busy || !name.trim()}>
          <Save className="w-4 h-4" /> Save
        </PrimaryButton>
      </div>
    </div>
  );
}

function GroupDetails({
  id,
  onDeleted,
}: {
  id: number;
  onDeleted: () => void;
}) {
  const [data, setData] = useState<GroupDTO | undefined>();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [rows, setRows] = useState<BatchPermissionDTO[]>([]);

  useEffect(() => {
    (async () => {
      const g = await getGroup(id);
      setData(g);
      setName(g.name);
      const base = await listAllBatchesAsPermissions();
      const map = new Map(base.map((b) => [b.batchId, b] as const));
      (g.batchPermissions || []).forEach((p) => {
        map.set(p.batchId, { ...map.get(p.batchId)!, ...p });
      });
      setRows(Array.from(map.values()));
    })();
  }, [id]);

  async function save() {
    const payload = {
      name,
      batchPermissions: rows.filter((r) => r.scan || r.index || r.quality),
    };
    const g = await updateGroup(id, payload);
    setData(g);
    setEdit(false);
  }

  const totalAllowed = rows.filter(r => r.scan || r.index || r.quality).length;

  return data ? (
    <div className="max-w-4xl space-y-6">
      <SectionHeader
        icon={<BadgeCheck className="w-6 h-6" />}
        title={`Group: ${data.name}`}
        subtitle="Manage batch permissions for this group."
        extra={
          !edit ? (
            <div className="flex gap-2">
              <MutedButton onClick={() => setEdit(true)}>
                <Pencil className="w-4 h-4" /> Edit
              </MutedButton>
              <DangerButton
                onClick={async () => {
                  if (confirm("Delete this group?")) {
                    await deleteGroup(id);
                    onDeleted();
                  }
                }}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </DangerButton>
            </div>
          ) : (
            <div className="flex gap-2">
              <MutedButton onClick={() => setEdit(false)}>
                <X className="w-4 h-4" /> Cancel
              </MutedButton>
              <PrimaryButton onClick={save}>
                <Save className="w-4 h-4" /> Save
              </PrimaryButton>
            </div>
          )
        }
      />

      <div className="grid gap-2 max-w-lg">
        <label className="text-sm text-gray-300">Group Name</label>
        <TextInput
          disabled={!edit}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="text-xs text-gray-400">
          Allowed on <span className="text-indigo-300 font-medium">{totalAllowed}</span> batch
          {totalAllowed === 1 ? "" : "es"}
        </div>
      </div>

      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 text-[11px] uppercase tracking-wide bg-gray-800 text-gray-300 px-4 py-2">
          <div className="inline-flex items-center gap-2">
            <FolderKanban className="w-4 h-4" /> Batch
          </div>
          <div className="text-center inline-flex items-center justify-center gap-1">
            <ScanLine className="w-4 h-4" /> Scan
          </div>
          <div className="text-center inline-flex items-center justify-center gap-1">
            <ListChecks className="w-4 h-4" /> Index
          </div>
          <div className="text-center inline-flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Quality
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {rows.map((r, idx) => (
            <div
              key={r.batchId}
              className={`grid grid-cols-4 items-center px-4 py-2 ${
                edit ? "hover:bg-gray-900" : ""
              }`}
            >
              <div className="text-gray-200 text-sm">
                {r.batchName ?? r.batchId}
              </div>
              <div className="flex justify-center">
                <Toggle
                  disabled={!edit}
                  checked={r.scan}
                  onChange={(v) => {
                    const n = [...rows];
                    n[idx] = { ...r, scan: v };
                    setRows(n);
                  }}
                />
              </div>
              <div className="flex justify-center">
                <Toggle
                  disabled={!edit}
                  checked={r.index}
                  onChange={(v) => {
                    const n = [...rows];
                    n[idx] = { ...r, index: v };
                    setRows(n);
                  }}
                />
              </div>
              <div className="flex justify-center">
                <Toggle
                  disabled={!edit}
                  checked={r.quality}
                  onChange={(v) => {
                    const n = [...rows];
                    n[idx] = { ...r, quality: v };
                    setRows(n);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="text-gray-400">Loading...</div>
  );
}

// ---------------------------
// Users Tab
// ---------------------------
function UsersTab() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>();

  async function refresh() {
    const p = await listUsers({ q });
    setUsers(p.content);
    if (p.content.length > 0 && !selectedId) {
      setSelectedId(p.content[0].id);
    }
  }
  useEffect(() => {
    refresh();
  }, [q]);

  return (
    <div className="flex flex-1">
      {/* Left list */}
      <div className="w-80 border-r border-gray-800 bg-gray-900/40 p-3 space-y-3">
        <TextInput
          placeholder="Search users..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          data-icon={<Search className="w-4 h-4" />}
        />
        <div
          className="space-y-1 overflow-auto"
          style={{ maxHeight: "calc(100vh - 190px)" }}
        >
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedId(u.id)}
              className={`w-full text-left px-3 py-2 rounded-lg border ${
                selectedId === u.id
                  ? "bg-gray-700 text-white border-gray-600"
                  : "hover:bg-gray-800 text-gray-200 border-transparent"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                {u.username}
              </span>
            </button>
          ))}
          {users.length === 0 && (
            <div className="text-xs text-gray-500">No users</div>
          )}
        </div>
        <PrimaryButton onClick={() => setSelectedId(-1)}>
          <UserPlus className="w-4 h-4" /> Create User
        </PrimaryButton>
      </div>

      {/* Right panel */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedId === -1 ? (
          <UserCreate
            onCreated={(u) => {
              setSelectedId(u.id);
              refresh();
            }}
          />
        ) : selectedId ? (
          <UserDetails id={selectedId} onUpdated={refresh} />
        ) : (
          <div className="text-gray-400">Select a user</div>
        )}
      </div>
    </div>
  );
}

function UserCreate({ onCreated }: { onCreated: (u: UserDTO) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dailyTarget, setDailyTarget] = useState<number | "">("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const payload: any = { username, password };
      if (fullName) payload.fullName = fullName;
      if (dailyTarget !== "") payload.dailyTargetMinutes = Number(dailyTarget);
      const u = await createUser(payload);
      onCreated(u);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <SectionHeader
        icon={<UserPlus className="w-6 h-6" />}
        title="Create User"
        subtitle="Only username & password are required. Roles/Groups can be set later."
      />

      <div className="grid gap-2">
        <label className="text-sm text-gray-300">Username *</label>
        <TextInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g., jdoe"
          data-icon={<Users className="w-4 h-4" />}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-gray-300">Password *</label>
        <TextInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          data-icon={<Shield className="w-4 h-4" />}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-gray-300">Full Name</label>
        <TextInput
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          data-icon={<BadgeCheck className="w-4 h-4" />}
        />
      </div>
      <div className="grid gap-2 max-w-xs">
        <label className="text-sm text-gray-300">Daily Target (minutes)</label>
        <TextInput
          inputMode="numeric"
          value={dailyTarget as any}
          onChange={(e) => setDailyTarget(e.target.value)}
          placeholder="120"
          data-icon={<ListChecks className="w-4 h-4" />}
        />
      </div>
      <div className="flex gap-2">
        <PrimaryButton
          onClick={save}
          disabled={busy || !username.trim() || !password.trim()}
        >
          <Save className="w-4 h-4" /> Create
        </PrimaryButton>
      </div>
    </div>
  );
}

function UserDetails({ id, onUpdated }: { id: number; onUpdated: () => void }) {
  const [u, setU] = useState<UserDTO | undefined>();
  const [edit, setEdit] = useState(false);
  const [fullName, setFullName] = useState("");
  const [dailyTarget, setDailyTarget] = useState<number | "">("");

  // group modal state
  const [showGroups, setShowGroups] = useState(false);
  const [allGroups, setAllGroups] = useState<GroupDTO[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [savingGroups, setSavingGroups] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getUser(id);
      setU(user);
      setFullName(user.fullName || "");
      setDailyTarget(user.dailyTargetMinutes ?? "");

      const pg = await listGroups({ page: 0, size: 200 });
      setAllGroups(pg.content);

      const initial = pg.content
        .filter((g) => (user.groups || []).includes(g.name))
        .map((g) => g.id);
      setSelectedGroupIds(initial);
    })();
  }, [id]);

  async function save() {
    await updateUser(id, {
      fullName,
      dailyTargetMinutes: dailyTarget === "" ? undefined : Number(dailyTarget),
    });
    setEdit(false);
    onUpdated();
    const fresh = await getUser(id);
    setU(fresh);
  }

  async function applyGroups() {
    setSavingGroups(true);
    try {
      await updateUser(id, { groupIds: selectedGroupIds });
      setShowGroups(false);
      onUpdated();
      const fresh = await getUser(id);
      setU(fresh);
    } finally {
      setSavingGroups(false);
    }
  }

  return u ? (
    <div className="max-w-3xl space-y-6">
      <SectionHeader
        icon={<Users className="w-6 h-6" />}
        title={u.username}
        subtitle="User details & group membership"
        extra={
          !edit ? (
            <div className="flex gap-2">
              <MutedButton onClick={() => setShowGroups(true)}>
                <BadgeCheck className="w-4 h-4" /> Edit Groups
              </MutedButton>
              <MutedButton onClick={() => setEdit(true)}>
                <Pencil className="w-4 h-4" /> Edit
              </MutedButton>
            </div>
          ) : (
            <div className="flex gap-2">
              <MutedButton onClick={() => setEdit(false)}>
                <X className="w-4 h-4" /> Cancel
              </MutedButton>
              <PrimaryButton onClick={save}>
                <Save className="w-4 h-4" /> Save
              </PrimaryButton>
            </div>
          )
        }
      />

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-sm text-gray-300">Full Name</label>
          <TextInput
            disabled={!edit}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            data-icon={<BadgeCheck className="w-4 h-4" />}
          />
        </div>
        <div className="grid gap-2 max-w-xs">
          <label className="text-sm text-gray-300">Daily Target (minutes)</label>
          <TextInput
            disabled={!edit}
            inputMode="numeric"
            value={dailyTarget as any}
            onChange={(e) => setDailyTarget(e.target.value)}
            data-icon={<ListChecks className="w-4 h-4" />}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Groups</h3>
        <div className="rounded-xl border border-gray-800 p-4 bg-gray-900/40">
          {u.groups && u.groups.length > 0 ? (
            <ul className="text-gray-200 text-sm grid sm:grid-cols-2 gap-y-1">
              {u.groups.map((g) => (
                <li key={g} className="inline-flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-indigo-400" />
                  {g}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No groups assigned yet.</div>
          )}
        </div>
      </div>

      {/* Groups Modal */}
      {showGroups && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-gray-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold text-gray-100 inline-flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-indigo-400" />
                Edit Groups
              </h4>
              <button
                className="text-gray-400 hover:text-gray-200"
                onClick={() => setShowGroups(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-auto space-y-2 pr-1">
              {allGroups.map((g) => {
                const checked = selectedGroupIds.includes(g.id);
                return (
                  <label
                    key={g.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 cursor-pointer border border-transparent"
                  >
                    <span className="inline-flex items-center gap-2 text-sm text-gray-200">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      {g.name}
                    </span>
                    <input
                      type="checkbox"
                      className="accent-indigo-500 h-4 w-4"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedGroupIds((prev) =>
                          e.target.checked
                            ? [...prev, g.id]
                            : prev.filter((x) => x !== g.id)
                        );
                      }}
                    />
                  </label>
                );
              })}
              {allGroups.length === 0 && (
                <div className="text-sm text-gray-500">No groups found.</div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <MutedButton onClick={() => setShowGroups(false)} disabled={savingGroups}>
                <X className="w-4 h-4" /> Close
              </MutedButton>
              <PrimaryButton onClick={applyGroups} disabled={savingGroups}>
                {savingGroups ? "Saving..." : (<><Save className="w-4 h-4" /> Apply</>)}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="text-gray-400">Loading...</div>
  );
}

export default UsersAccessPage;
