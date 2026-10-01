"use client";

import { AnimatePresence, motion } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  FileImage,
  FilePlus2,
  FileText,
  Filter,
  Fingerprint,
  FolderOpen,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sun,
  Upload,
  Users,
  UserRound,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Coordinates, DocumentFields, renderDocument } from "@/lib/documents";
import { readFiles, writeFiles } from "@/lib/file-store";

type Role = "Admin" | "Staff" | "Client";
type Stage = "Submission" | "Verification" | "Biometric" | "Visa Grant";
type AppRecord = {
  id: string;
  name: string;
  country: string;
  type: string;
  stage: Stage;
  updated: string;
  initials: string;
  color: string;
};
type ManagedFile = {
  id: string;
  name: string;
  kind: string;
  status: "Pending Review" | "Verified" | "Rejected";
  size: string;
  data?: string;
  mime?: string;
};
type View =
  | "Overview"
  | "Applications"
  | "Documents"
  | "Team"
  | "Files"
  | "Audit log"
  | "Settings"
  | "Access & security";

const stages: Stage[] = [
  "Submission",
  "Verification",
  "Biometric",
  "Visa Grant",
];
const maxFileSize = 20 * 1024 * 1024;
const docTypes = [
  "Work Permit Visa Application",
  "Job Offer Letter",
  "Police Clearance Document",
  "E-Medical Report",
  "Visa Grant Notification",
  "Biometric Appointment & Confirmation",
  "Air Ticket / Booking Confirmation",
  "Visa Copy / Sticker Document",
];
const initialApps: AppRecord[] = [
  {
    id: "GMH-24091",
    name: "Amara Okafor",
    country: "Canada",
    type: "Work permit",
    stage: "Verification",
    updated: "12 min ago",
    initials: "AO",
    color: "coral",
  },
  {
    id: "GMH-24088",
    name: "Mateo Silva",
    country: "Portugal",
    type: "Skilled worker",
    stage: "Biometric",
    updated: "48 min ago",
    initials: "MS",
    color: "blue",
  },
  {
    id: "GMH-24083",
    name: "Priya Nair",
    country: "Australia",
    type: "Student visa",
    stage: "Submission",
    updated: "2 hours ago",
    initials: "PN",
    color: "gold",
  },
  {
    id: "GMH-24079",
    name: "Hassan Rahman",
    country: "United Kingdom",
    type: "Family visa",
    stage: "Visa Grant",
    updated: "4 hours ago",
    initials: "HR",
    color: "green",
  },
];
const initialFiles: ManagedFile[] = [
  {
    id: "f1",
    name: "Passport_Amara_Okafor.pdf",
    kind: "Passport scan",
    status: "Verified",
    size: "2.4 MB",
  },
  {
    id: "f2",
    name: "Academic_Transcript.pdf",
    kind: "Academic certificate",
    status: "Pending Review",
    size: "1.8 MB",
  },
  {
    id: "f3",
    name: "Bank_Statement_Jun.pdf",
    kind: "Bank statement",
    status: "Rejected",
    size: "980 KB",
  },
  {
    id: "f4",
    name: "Portrait_Amara.jpg",
    kind: "Photo",
    status: "Verified",
    size: "640 KB",
  },
];
const people = [
  {
    name: "Amara Okafor",
    email: "amara.okafor@email.com",
    role: "Client",
    cases: 1,
    state: "Active",
  },
  {
    name: "Mateo Silva",
    email: "mateo.silva@email.com",
    role: "Client",
    cases: 1,
    state: "Active",
  },
  {
    name: "Priya Nair",
    email: "priya.nair@email.com",
    role: "Client",
    cases: 1,
    state: "Active",
  },
  {
    name: "Hassan Rahman",
    email: "hassan.rahman@email.com",
    role: "Client",
    cases: 1,
    state: "Active",
  },
  {
    name: "Elena Petrova",
    email: "elena.petrova@globalhub.co",
    role: "Staff",
    cases: 24,
    state: "Active",
  },
  {
    name: "Daniel Kim",
    email: "daniel.kim@globalhub.co",
    role: "Staff",
    cases: 18,
    state: "Active",
  },
];
const initialActivity = [
  {
    title: "Passport verified",
    detail: "Elena Petrova · GMH-24091",
    time: "12 min ago",
    icon: "check",
  },
  {
    title: "Biometric appointment booked",
    detail: "Mateo Silva · GMH-24088",
    time: "48 min ago",
    icon: "calendar",
  },
  {
    title: "New application received",
    detail: "Priya Nair · GMH-24083",
    time: "2 hours ago",
    icon: "file",
  },
];

const navItems: {
  label: View;
  icon: typeof LayoutDashboard;
  section: string;
}[] = [
  { label: "Overview", icon: LayoutDashboard, section: "WORKSPACE" },
  { label: "Applications", icon: BriefcaseBusiness, section: "WORKSPACE" },
  { label: "Documents", icon: FileCheck2, section: "WORKSPACE" },
  { label: "Files", icon: FolderOpen, section: "WORKSPACE" },
  { label: "Team", icon: Users, section: "MANAGE" },
  { label: "Audit log", icon: Activity, section: "MANAGE" },
  { label: "Settings", icon: Settings2, section: "SYSTEM" },
  { label: "Access & security", icon: ShieldCheck, section: "SYSTEM" },
];

function readStore<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export default function Home() {
  const [view, setView] = useState<View>("Overview");
  const [role, setRole] = useState<Role>("Admin");
  const [dark, setDark] = useState(false);
  const [apps, setApps] = useState<AppRecord[]>(initialApps);
  const [files, setFiles] = useState<ManagedFile[]>(initialFiles);
  const [filesReady, setFilesReady] = useState(false);
  const [activity, setActivity] = useState(initialActivity);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showPreview, setShowPreview] = useState<ManagedFile | null>(null);
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkReady, setDarkReady] = useState(false);

  useEffect(() => {
    setApps(readStore("gmh-apps", initialApps));
    setActivity(readStore("gmh-activity", initialActivity));
    setRole(readStore("gmh-role", "Admin"));
    setDark(readStore("gmh-dark", false));
    void readFiles(initialFiles).then((storedFiles) => {
      setFiles(storedFiles);
      setFilesReady(true);
    });
    setDarkReady(true);
  }, []);
  useEffect(() => {
    if (darkReady) {
      localStorage.setItem("gmh-apps", JSON.stringify(apps));
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      localStorage.setItem("gmh-dark", JSON.stringify(dark));
    }
  }, [apps, dark, darkReady]);
  useEffect(() => {
    if (darkReady) {
      localStorage.setItem("gmh-role", JSON.stringify(role));
      localStorage.setItem("gmh-activity", JSON.stringify(activity));
    }
  }, [role, activity, darkReady]);
  useEffect(() => {
    if (filesReady) void writeFiles(files);
  }, [files, filesReady]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredApps = useMemo(
    () =>
      apps.filter((app) =>
        `${app.name} ${app.id} ${app.country} ${app.type}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [apps, query],
  );
  const canManage = role !== "Client";
  const canAdmin = role === "Admin";
  const addActivity = (title: string, detail: string) =>
    setActivity((current) =>
      [
        {
          title,
          detail: `${role} · ${detail}`,
          time: "Just now",
          icon: "check",
        },
        ...current,
      ].slice(0, 8),
    );
  const advanceStage = (app: AppRecord, stage: Stage) => {
    if (!canManage) return;
    setApps((current) =>
      current.map((row) =>
        row.id === app.id ? { ...row, stage, updated: "Just now" } : row,
      ),
    );
    addActivity(`Stage changed to ${stage}`, app.id);
    setNotice(`Application ${app.id} updated`);
  };
  const createApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    const country = String(data.get("country") || "Canada");
    const record: AppRecord = {
      id: `GMH-${Math.floor(24100 + Math.random() * 800)}`,
      name,
      country,
      type: String(data.get("type") || "Work permit"),
      stage: "Submission",
      updated: "Just now",
      initials: name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      color: "teal",
    };
    setApps((current) => [record, ...current]);
    addActivity("New application created", record.id);
    setShowCreate(false);
    setView("Applications");
    setNotice("Application created");
  };

  const uploadFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const selected = Array.from(incoming);
    const accepted = selected.filter(
      (file) =>
        /^(application\/pdf|image\/png|image\/jpeg)$/.test(file.type) &&
        file.size <= maxFileSize,
    );
    if (!accepted.length) {
      setNotice("Choose a PDF, PNG, or JPG file smaller than 20 MB");
      return;
    }
    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setFiles((current) => [
          {
            id: crypto.randomUUID(),
            name: file.name,
            kind:
              file.type === "application/pdf" ? "Uploaded document" : "Photo",
            status: "Pending Review",
            size:
              file.size > 1024 * 1024
                ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                : `${Math.ceil(file.size / 1024)} KB`,
            data: String(reader.result),
            mime: file.type,
          },
          ...current,
        ]);
      reader.readAsDataURL(file);
    });
    addActivity(
      `${accepted.length} document${accepted.length === 1 ? "" : "s"} uploaded`,
      "File manager",
    );
    const skipped = selected.length - accepted.length;
    setNotice(
      `${accepted.length} file${accepted.length === 1 ? "" : "s"} added${skipped ? `; ${skipped} skipped (type or size)` : ""}`,
    );
  };
  const renameFile = (file: ManagedFile) => {
    const name = window.prompt("Rename document", file.name)?.trim();
    if (!name || name === file.name) return;
    setFiles((current) =>
      current.map((row) => (row.id === file.id ? { ...row, name } : row)),
    );
    addActivity("Document renamed", file.name);
    setNotice("Document renamed");
  };
  const downloadFile = (file: ManagedFile) => {
    if (!file.data) {
      setNotice("This sample file has metadata only");
      return;
    }
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };
  const replaceFile = (file: ManagedFile, replacement: File | null) => {
    if (!replacement) return;
    if (!/^(application\/pdf|image\/png|image\/jpeg)$/.test(replacement.type)) {
      setNotice("Choose a PDF, PNG, or JPG file");
      return;
    }
    if (replacement.size > maxFileSize) {
      setNotice("Files must be smaller than 20 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFiles((current) =>
        current.map((row) =>
          row.id === file.id
            ? {
                ...row,
                size:
                  replacement.size > 1024 * 1024
                    ? `${(replacement.size / 1024 / 1024).toFixed(1)} MB`
                    : `${Math.ceil(replacement.size / 1024)} KB`,
                status: "Pending Review",
                data: String(reader.result),
                mime: replacement.type,
              }
            : row,
        ),
      );
      addActivity("Document replaced", file.name);
      setNotice("Document replaced and marked for review");
    };
    reader.readAsDataURL(replacement);
  };
  const removeFile = (file: ManagedFile) => {
    if (!window.confirm(`Delete ${file.name}?`)) return;
    setFiles((current) => current.filter((row) => row.id !== file.id));
    addActivity("Document deleted", file.name);
    setNotice("Document deleted");
  };

  return (
    <div className={`app-shell ${dark ? "dark" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Globe2 size={20} />
          </span>
          <span>
            global<span className="brand-light">migration</span>
            <small>HUB</small>
          </span>
          <button
            className="icon-button sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-picker">
          <span className="workspace-avatar">G</span>
          <span className="workspace-label">
            <strong>Global Migration</strong>
            <small>Workspace</small>
          </span>
          <ChevronDown size={15} />
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          {["WORKSPACE", "MANAGE", "SYSTEM"].map((section) => (
            <div key={section}>
              <p className="nav-section">{section}</p>
              {navItems
                .filter((item) => item.section === section)
                .map(({ label, icon: Icon }) => {
                  const locked =
                    (label === "Team" ||
                      label === "Settings" ||
                      label === "Access & security") &&
                    !canAdmin;
                  return (
                    <button
                      key={label}
                      className={`nav-link ${view === label ? "active" : ""}`}
                      onClick={() => {
                        if (!locked) {
                          setView(label);
                          setSidebarOpen(false);
                        } else setNotice("Admin access required");
                      }}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      <span>{label}</span>
                      {label === "Applications" && (
                        <span className="nav-count">{apps.length}</span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-panel">
            <span className="help-icon">
              <CircleHelp size={18} />
            </span>
            <strong>Need a hand?</strong>
            <p>Visit the knowledge center for workflow guides.</p>
            <button
              onClick={() =>
                setNotice(
                  "Knowledge center is available in the full deployment",
                )
              }
            >
              Open help center <ArrowRight size={14} />
            </button>
          </div>
          <div className="sidebar-user">
            <div className="avatar avatar-green">
              {role === "Client" ? "AO" : "EP"}
            </div>
            <div className="user-copy">
              <strong>
                {role === "Client" ? "Amara Okafor" : "Elena Petrova"}
              </strong>
              <small>{role} account</small>
            </div>
            <button
              className="icon-button"
              onClick={() => setView("Settings")}
              aria-label="Open account settings"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button menu-trigger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="crumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{view}</strong>
          </div>
          <div className="top-actions">
            <label className="top-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search anything..."
                aria-label="Search applications"
              />
              <kbd>⌘ K</kbd>
            </label>
            <button
              className="icon-button theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-button notification-button"
              onClick={() => setNotice("You are all caught up")}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <span className="top-divider" />
            <div className="role-control">
              <UserRound size={15} />
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                aria-label="Demo role"
              >
                <option>Admin</option>
                <option>Staff</option>
                <option>Client</option>
              </select>
              <ChevronDown size={13} />
            </div>
          </div>
        </header>
        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.section
              key={view}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {view === "Overview" && (
                <Overview
                  apps={apps}
                  activity={activity}
                  role={role}
                  onNavigate={setView}
                  onCreate={() => setShowCreate(true)}
                  onStage={advanceStage}
                />
              )}
              {view === "Applications" && (
                <Applications
                  apps={filteredApps}
                  query={query}
                  setQuery={setQuery}
                  canManage={canManage}
                  onCreate={() => setShowCreate(true)}
                  onStage={advanceStage}
                />
              )}
              {view === "Documents" && (
                <DocumentStudio notify={setNotice} log={addActivity} />
              )}
              {view === "Files" && (
                <FileManager
                  files={files}
                  onUpload={uploadFiles}
                  onPreview={setShowPreview}
                  onRename={renameFile}
                  onDownload={downloadFile}
                  onReplace={replaceFile}
                  onDelete={removeFile}
                  editable={canManage}
                  onStatus={(file, status) => {
                    setFiles((current) =>
                      current.map((row) =>
                        row.id === file.id ? { ...row, status } : row,
                      ),
                    );
                    addActivity(
                      `Document marked ${status.toLowerCase()}`,
                      file.name,
                    );
                  }}
                />
              )}
              {view === "Team" && <TeamDirectory role={role} />}
              {view === "Audit log" && <AuditLog activity={activity} />}
              {view === "Settings" && (
                <Settings
                  dark={dark}
                  setDark={setDark}
                  role={role}
                  onNotice={setNotice}
                />
              )}
              {view === "Access & security" && (
                <Security
                  role={role}
                  twoFactor={twoFactor}
                  setTwoFactor={setTwoFactor}
                  biometric={biometric}
                  setBiometric={setBiometric}
                  isSignup={isSignup}
                  setIsSignup={setIsSignup}
                  onNotice={setNotice}
                />
              )}
            </motion.section>
          </AnimatePresence>
        </div>
      </main>

      {sidebarOpen && (
        <button
          className="mobile-scrim"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <AnimatePresence>
        {showCreate && (
          <Modal
            title="Start an application"
            onClose={() => setShowCreate(false)}
          >
            <form className="modal-form" onSubmit={createApplication}>
              <label>
                Client full name
                <input
                  name="name"
                  placeholder="e.g. Jordan Lee"
                  required
                  autoFocus
                />
              </label>
              <label>
                Destination country
                <select name="country">
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>United Kingdom</option>
                  <option>Portugal</option>
                  <option>United States</option>
                </select>
              </label>
              <label>
                Application type
                <select name="type">
                  <option>Work permit</option>
                  <option>Skilled worker</option>
                  <option>Student visa</option>
                  <option>Family visa</option>
                  <option>Visitor visa</option>
                </select>
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button className="button button-primary">
                  <Plus size={16} /> Create application
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPreview && (
          <Modal
            title={showPreview.name}
            onClose={() => setShowPreview(null)}
            wide
          >
            <div className="preview-content">
              {showPreview.mime?.startsWith("image/") ? (
                <img src={showPreview.data} alt={showPreview.name} />
              ) : showPreview.data ? (
                <iframe
                  title={`Preview ${showPreview.name}`}
                  src={showPreview.data}
                />
              ) : (
                <div className="preview-placeholder">
                  <FileText size={40} />
                  <span>No preview available for this sample file.</span>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {notice && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Check size={16} />
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function Overview({
  apps,
  activity,
  role,
  onNavigate,
  onCreate,
  onStage,
}: {
  apps: AppRecord[];
  activity: typeof initialActivity;
  role: Role;
  onNavigate: (view: View) => void;
  onCreate: () => void;
  onStage: (app: AppRecord, stage: Stage) => void;
}) {
  const completed = apps.filter((app) => app.stage === "Visa Grant").length;
  const metrics = [
    {
      label: "Files processed",
      value: "1,284",
      delta: "+12.8%",
      icon: FileCheck2,
      color: "teal",
      data: [35, 48, 42, 65, 54, 72, 61, 88],
    },
    {
      label: "Pending applications",
      value: String(
        apps.filter((app) => app.stage !== "Visa Grant").length + 126,
      ),
      delta: "8 need attention",
      icon: Clock3,
      color: "amber",
      data: [66, 48, 55, 41, 63, 50, 68, 56],
    },
    {
      label: "Visa grant rate",
      value: "86.4%",
      delta: "+4.2% this quarter",
      icon: BadgeCheck,
      color: "blue",
      data: [42, 58, 52, 66, 61, 75, 70, 88],
    },
    {
      label: "Active clients",
      value: "342",
      delta: "+18 this month",
      icon: Users,
      color: "coral",
      data: [35, 40, 54, 47, 61, 58, 77, 84],
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="THURSDAY, OCTOBER 1, 2026"
        title="Good morning, Elena"
        description="Here’s what’s happening across your migration workspace today."
        action={
          role !== "Client" && (
            <button className="button button-primary" onClick={onCreate}>
              <Plus size={17} /> New application
            </button>
          )
        }
      />
      <div className="metrics-grid">
        {metrics.map(({ label, value, delta, icon: Icon, color, data }) => (
          <article className="metric-card" key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <span className={`metric-icon ${color}`}>
                <Icon size={17} />
              </span>
            </div>
            <div className="metric-value">
              {role === "Client" && label !== "Active clients"
                ? label === "Visa grant rate"
                  ? "In progress"
                  : "04"
                : value}
            </div>
            <div className="metric-bottom">
              <span
                className={color === "amber" ? "muted-note" : "positive-note"}
              >
                {delta}
              </span>
              <div className={`sparkline ${color}`}>
                {data.map((height, i) => (
                  <i key={i} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="overview-grid">
        <section className="panel applications-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent applications</h2>
              <p>Latest activity across your active cases</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Applications")}
            >
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>DESTINATION</th>
                  <th>STAGE</th>
                  <th>UPDATED</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 5).map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="client-cell">
                        <span className={`avatar avatar-${app.color}`}>
                          {app.initials}
                        </span>
                        <span>
                          <strong>{app.name}</strong>
                          <small>{app.id}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="country-cell">
                        <span className="country-dot">
                          {app.country === "Canada"
                            ? "CA"
                            : app.country === "Portugal"
                              ? "PT"
                              : app.country === "Australia"
                                ? "AU"
                                : "UK"}
                        </span>
                        {app.country}
                      </span>
                    </td>
                    <td>
                      <StageSelect
                        app={app}
                        onStage={onStage}
                        disabled={role === "Client"}
                      />
                    </td>
                    <td className="time-cell">{app.updated}</td>
                    <td>
                      <button
                        className="icon-button row-more"
                        aria-label={`More options for ${app.name}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="mobile-view-all"
            onClick={() => onNavigate("Applications")}
          >
            View all applications <ArrowRight size={15} />
          </button>
        </section>
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Updates from your team</p>
            </div>
            <button className="icon-button" aria-label="Activity options">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="activity-list">
            {activity.slice(0, 5).map((item, i) => (
              <div className="activity-row" key={`${item.title}-${i}`}>
                <span className={`activity-icon activity-${item.icon}`}>
                  {item.icon === "calendar" ? (
                    <CalendarDays size={15} />
                  ) : item.icon === "file" ? (
                    <FileText size={15} />
                  ) : (
                    <Check size={15} />
                  )}
                </span>
                <div className="activity-copy">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
          <button
            className="text-button activity-link"
            onClick={() => onNavigate("Audit log")}
          >
            View audit log <ArrowRight size={15} />
          </button>
        </section>
      </div>
      <div className="bottom-grid">
        <section className="panel workflow-panel">
          <div className="panel-heading">
            <div>
              <h2>Application pipeline</h2>
              <p>Distribution by current processing stage</p>
            </div>
            <button
              className="select-compact"
              onClick={() => onNavigate("Applications")}
            >
              This month <ChevronDown size={14} />
            </button>
          </div>
          <div className="pipeline-chart">
            {stages.map((stage, index) => {
              const count =
                stage === "Submission"
                  ? 38
                  : stage === "Verification"
                    ? 27
                    : stage === "Biometric"
                      ? 19
                      : Math.max(completed + 8, 11);
              return (
                <div className="pipeline-col" key={stage}>
                  <div className="pipeline-number">{count}</div>
                  <div className="pipeline-track">
                    <div
                      className={`pipeline-fill p${index + 1}`}
                      style={{ height: `${[82, 64, 48, 34][index]}%` }}
                    />
                  </div>
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Common tasks, right at hand</p>
            </div>
          </div>
          <div className="quick-actions">
            <button onClick={onCreate} disabled={role === "Client"}>
              <span className="quick-icon q-teal">
                <FilePlus2 size={18} />
              </span>
              <span>
                <strong>New application</strong>
                <small>Start a client case</small>
              </span>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => onNavigate("Documents")}>
              <span className="quick-icon q-gold">
                <FileImage size={18} />
              </span>
              <span>
                <strong>Generate document</strong>
                <small>Create a print-ready file</small>
              </span>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => onNavigate("Files")}>
              <span className="quick-icon q-coral">
                <Upload size={18} />
              </span>
              <span>
                <strong>Upload documents</strong>
                <small>Add files to a client record</small>
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

function StageSelect({
  app,
  onStage,
  disabled,
}: {
  app: AppRecord;
  onStage: (app: AppRecord, stage: Stage) => void;
  disabled: boolean;
}) {
  const tone: Record<Stage, string> = {
    Submission: "amber",
    Verification: "blue",
    Biometric: "violet",
    "Visa Grant": "green",
  };
  return (
    <label className={`stage-select stage-${tone[app.stage]}`}>
      <span className="stage-dot" />
      <select
        aria-label={`Stage for ${app.name}`}
        value={app.stage}
        disabled={disabled}
        onChange={(event) => onStage(app, event.target.value as Stage)}
      >
        {stages.map((stage) => (
          <option key={stage}>{stage}</option>
        ))}
      </select>
      <ChevronDown size={12} />
    </label>
  );
}

function Applications({
  apps,
  query,
  setQuery,
  canManage,
  onCreate,
  onStage,
}: {
  apps: AppRecord[];
  query: string;
  setQuery: (value: string) => void;
  canManage: boolean;
  onCreate: () => void;
  onStage: (app: AppRecord, stage: Stage) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="CASE MANAGEMENT"
        title="Applications"
        description="Track every client case from submission through visa grant."
        action={
          canManage && (
            <button className="button button-primary" onClick={onCreate}>
              <Plus size={17} /> New application
            </button>
          )
        }
      />
      <section className="panel directory-panel">
        <div className="list-toolbar">
          <label className="list-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, reference, country..."
            />
          </label>
          <button className="button button-quiet" onClick={() => setQuery("")}>
            <Filter size={16} /> Filters
          </button>
          <span className="toolbar-count">{apps.length} applications</span>
        </div>
        <div className="table-wrap">
          <table className="data-table full-table">
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>REFERENCE</th>
                <th>DESTINATION</th>
                <th>VISA TYPE</th>
                <th>PROCESSING STAGE</th>
                <th>LAST UPDATED</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="client-cell">
                      <span className={`avatar avatar-${app.color}`}>
                        {app.initials}
                      </span>
                      <strong>{app.name}</strong>
                    </div>
                  </td>
                  <td className="reference-cell">{app.id}</td>
                  <td>{app.country}</td>
                  <td>{app.type}</td>
                  <td>
                    <StageSelect
                      app={app}
                      onStage={onStage}
                      disabled={!canManage}
                    />
                  </td>
                  <td className="time-cell">{app.updated}</td>
                  <td>
                    <button
                      className="icon-button row-more"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!apps.length && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No applications match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Showing {apps.length} of {apps.length} applications{" "}
          <div>
            <button className="icon-button" aria-label="Previous page">
              <ChevronLeft size={17} />
            </button>
            <button className="page-number">1</button>
            <button className="icon-button" aria-label="Next page">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function DocumentStudio({
  notify,
  log,
}: {
  notify: (message: string) => void;
  log: (title: string, detail: string) => void;
}) {
  const [type, setType] = useState(docTypes[0]);
  const [name, setName] = useState("Amara Okafor");
  const [passport, setPassport] = useState("NGA-9082741");
  const [reference, setReference] = useState("GMH-24091");
  const [issueDate, setIssueDate] = useState("01 October 2026");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [background, setBackground] = useState("");
  const [coords, setCoords] = useState<Coordinates>({
    name: { x: 112, y: 432 },
    passport: { x: 112, y: 526 },
    photo: { x: 1300, y: 320 },
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generate = async () => {
    setBusy(true);
    try {
      const image = await renderDocument(
        {
          clientName: name,
          passport,
          reference,
          issueDate,
          documentName: type,
        },
        coords,
        background || undefined,
      );
      setOutput(image);
      log("Document generated", `${reference} · ${type}`);
      notify("Print-ready document created");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Document could not be generated",
      );
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f6f7f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (output) {
      const image = new Image();
      image.onload = () =>
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = output;
      return;
    }
    ctx.fillStyle = "#173b38";
    ctx.fillRect(0, 0, canvas.width, 158);
    ctx.fillStyle = "#d9b56d";
    ctx.fillRect(0, 158, canvas.width, 8);
    ctx.fillStyle = "#fff";
    ctx.font = "600 25px Georgia";
    ctx.fillText("GLOBAL MIGRATION HUB", 112, 82);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#c8d8d2";
    ctx.fillText("DOCUMENT SERVICES  /  VERIFIED COPY", 112, 116);
    ctx.fillStyle = "#153b37";
    ctx.font = "600 38px Georgia";
    ctx.fillText(type.toUpperCase(), 112, 258);
    ctx.strokeStyle = "#d8ddda";
    ctx.beginPath();
    ctx.moveTo(112, 286);
    ctx.lineTo(1488, 286);
    ctx.stroke();
    ctx.fillStyle = "#74817d";
    ctx.font = "15px Arial";
    ctx.fillText("CLIENT NAME", coords.name.x, coords.name.y - 36);
    ctx.fillText("PASSPORT NUMBER", coords.passport.x, coords.passport.y - 32);
    ctx.fillStyle = "#182d2a";
    ctx.font = "600 31px Arial";
    ctx.fillText(name || "Client name", coords.name.x, coords.name.y);
    ctx.font = "23px Arial";
    ctx.fillText(
      passport || "Passport number",
      coords.passport.x,
      coords.passport.y,
    );
    ctx.fillStyle = "#61706c";
    ctx.font = "15px Arial";
    ctx.fillText("REFERENCE NUMBER", 112, 610);
    ctx.fillStyle = "#182d2a";
    ctx.font = "21px Arial";
    ctx.fillText(reference, 112, 646);
    ctx.fillStyle = "#61706c";
    ctx.font = "15px Arial";
    ctx.fillText("ISSUE DATE", 112, 714);
    ctx.fillStyle = "#182d2a";
    ctx.font = "21px Arial";
    ctx.fillText(issueDate, 112, 750);
    ctx.strokeStyle = "#d8ddda";
    ctx.beginPath();
    ctx.moveTo(112, 840);
    ctx.lineTo(1488, 840);
    ctx.stroke();
    ctx.fillStyle = "#74817d";
    ctx.font = "14px Arial";
    ctx.fillText("DEMO DOCUMENT  ·  Verify all details before use", 112, 884);
    ctx.strokeStyle = "#bcc6c1";
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(coords.name.x - 10, coords.name.y - 44, 390, 58);
    ctx.strokeRect(coords.passport.x - 10, coords.passport.y - 37, 360, 45);
    ctx.setLineDash([]);
  }, [type, name, passport, reference, issueDate, output, coords, background]);
  const downloadPdf = () => {
    if (!output) return notify("Generate a document first");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1600, 1000],
    });
    pdf.addImage(output, "PNG", 0, 0, 1600, 1000);
    pdf.save(
      `${reference}-${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
    );
  };
  const print = () => {
    if (!output) return notify("Generate a document first");
    const popup = window.open("", "_blank");
    if (!popup) return notify("Allow pop-ups to print this document");
    popup.document.write(
      `<html><head><title>${reference}</title><style>body{margin:0}img{width:100%;height:auto}@media print{@page{size:landscape;margin:0}}</style></head><body><img src="${output}" onload="window.print()"></body></html>`,
    );
    popup.document.close();
  };
  const setTemplate = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/"))
      return notify("Template must be an image file");
    const reader = new FileReader();
    reader.onload = () => {
      setBackground(String(reader.result));
      setOutput("");
    };
    reader.readAsDataURL(file);
  };
  const mapCoordinate = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) * 1600) / rect.width);
    const y = Math.round(((event.clientY - rect.top) * 1000) / rect.height);
    const target = window.confirm(
      "Place the client name at this position? Choose Cancel to position the passport number.",
    )
      ? "name"
      : "passport";
    setCoords((current) => ({ ...current, [target]: { x, y } }));
    setOutput("");
  };
  return (
    <>
      <PageHeading
        eyebrow="DOCUMENT WORKSPACE"
        title="Document studio"
        description="Compose verified documents from your templates and client records."
      />
      <div className="studio-layout">
        <section className="panel studio-form">
          <div className="studio-section-title">
            <span className="section-index">01</span>
            <div>
              <h2>Document details</h2>
              <p>Choose a document and enter holder details.</p>
            </div>
          </div>
          <label className="field-label">
            DOCUMENT TYPE
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setOutput("");
              }}
            >
              {docTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            CLIENT NAME
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="field-label">
            PASSPORT NUMBER
            <input
              value={passport}
              onChange={(event) => setPassport(event.target.value)}
            />
          </label>
          <div className="field-row">
            <label className="field-label">
              REFERENCE
              <input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </label>
            <label className="field-label">
              ISSUE DATE
              <input
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
              />
            </label>
          </div>
          <div className="studio-section-title template-title">
            <span className="section-index">02</span>
            <div>
              <h2>Template & placement</h2>
              <p>Use the sample or add your own image.</p>
            </div>
          </div>
          <label className="template-upload">
            <Upload size={17} />
            <span>
              {background
                ? "Replace background template"
                : "Upload background template"}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={setTemplate}
            />
          </label>
          <div className="coordinate-row">
            <span>Name</span>
            <label>
              X{" "}
              <input
                type="number"
                value={coords.name.x}
                onChange={(event) =>
                  setCoords((current) => ({
                    ...current,
                    name: { ...current.name, x: Number(event.target.value) },
                  }))
                }
              />
            </label>
            <label>
              Y{" "}
              <input
                type="number"
                value={coords.name.y}
                onChange={(event) =>
                  setCoords((current) => ({
                    ...current,
                    name: { ...current.name, y: Number(event.target.value) },
                  }))
                }
              />
            </label>
          </div>
          <div className="coordinate-row">
            <span>Passport</span>
            <label>
              X{" "}
              <input
                type="number"
                value={coords.passport.x}
                onChange={(event) =>
                  setCoords((current) => ({
                    ...current,
                    passport: {
                      ...current.passport,
                      x: Number(event.target.value),
                    },
                  }))
                }
              />
            </label>
            <label>
              Y{" "}
              <input
                type="number"
                value={coords.passport.y}
                onChange={(event) =>
                  setCoords((current) => ({
                    ...current,
                    passport: {
                      ...current.passport,
                      y: Number(event.target.value),
                    },
                  }))
                }
              />
            </label>
          </div>
          <button
            className="button button-primary generate-button"
            onClick={generate}
            disabled={busy}
          >
            <FilePlus2 size={17} />
            {busy ? "Generating…" : "Generate document"}
          </button>
          <p className="studio-disclaimer">
            <LockKeyhole size={13} /> Demo documents are not government-issued.
          </p>
        </section>
        <section className="preview-column">
          <div className="preview-toolbar">
            <div>
              <strong>Live preview</strong>
              <span>1600 × 1000 px · High resolution</span>
            </div>
            <div className="preview-actions">
              <button
                className="icon-button"
                onClick={print}
                aria-label="Print document"
                title="Print"
              >
                <Printer size={17} />
              </button>
              <button
                className="icon-button"
                onClick={downloadPdf}
                aria-label="Download PDF"
                title="Download PDF"
              >
                <ArrowDownToLine size={17} />
              </button>
            </div>
          </div>
          <div className="canvas-stage">
            <canvas
              ref={canvasRef}
              width={1600}
              height={1000}
              onClick={mapCoordinate}
              aria-label="Document preview. Click to position a text field."
            />
            <div className="canvas-hint">
              Click preview to map a text position
            </div>
          </div>
          <div className="preview-footer">
            <span>
              <span className="verified-dot" /> QR verification code included
            </span>
            <button className="text-button" onClick={downloadPdf}>
              Download PDF <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

function FileManager({
  files,
  onUpload,
  onPreview,
  onRename,
  onDownload,
  onReplace,
  onDelete,
  onStatus,
  editable,
}: {
  files: ManagedFile[];
  onUpload: (files: FileList | null) => void;
  onPreview: (file: ManagedFile) => void;
  onRename: (file: ManagedFile) => void;
  onDownload: (file: ManagedFile) => void;
  onReplace: (file: ManagedFile, replacement: File | null) => void;
  onDelete: (file: ManagedFile) => void;
  onStatus: (file: ManagedFile, status: ManagedFile["status"]) => void;
  editable: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<ManagedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    onUpload(event.dataTransfer.files);
  };
  return (
    <>
      <PageHeading
        eyebrow="CLIENT RECORDS"
        title="Document files"
        description="Review, organize, and manage client-submitted documents."
        action={
          <button
            className="button button-primary"
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={16} /> Upload files
          </button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        multiple
        hidden
        onChange={(event) => onUpload(event.target.files)}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        hidden
        onChange={(event) => {
          if (replaceTarget)
            onReplace(replaceTarget, event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
          setReplaceTarget(null);
        }}
      />
      <div className="file-layout">
        <div className="file-main">
          <div className="panel directory-panel">
            <div className="panel-heading file-heading">
              <div>
                <h2>
                  All documents{" "}
                  <span className="subtle-count">{files.length}</span>
                </h2>
                <p>Files associated with client applications</p>
              </div>
              <button className="button button-quiet">
                <Filter size={16} /> Filter
              </button>
            </div>
            <div className="table-wrap">
              <table className="data-table file-table">
                <thead>
                  <tr>
                    <th>FILE NAME</th>
                    <th>CATEGORY</th>
                    <th>STATUS</th>
                    <th>SIZE</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <button
                          className="file-name"
                          onClick={() => onPreview(file)}
                        >
                          <span
                            className={`file-icon ${file.mime?.startsWith("image/") ? "file-image" : ""}`}
                          >
                            <FileText size={17} />
                          </span>
                          <span>{file.name}</span>
                        </button>
                      </td>
                      <td>{file.kind}</td>
                      <td>
                        <label
                          className={`file-status status-${file.status.toLowerCase().replace(" ", "-")}`}
                        >
                          <select
                            aria-label={`Status for ${file.name}`}
                            value={file.status}
                            disabled={!editable}
                            onChange={(event) =>
                              onStatus(
                                file,
                                event.target.value as ManagedFile["status"],
                              )
                            }
                          >
                            <option>Pending Review</option>
                            <option>Verified</option>
                            <option>Rejected</option>
                          </select>
                          <ChevronDown size={12} />
                        </label>
                      </td>
                      <td className="time-cell">{file.size}</td>
                      <td>
                        <div className="file-actions">
                          <button
                            className="icon-button"
                            onClick={() => onPreview(file)}
                            aria-label="Preview"
                          >
                            <Search size={15} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => onRename(file)}
                            aria-label="Rename"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => onDownload(file)}
                            aria-label="Download"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => {
                              setReplaceTarget(file);
                              replaceRef.current?.click();
                            }}
                            aria-label="Replace file"
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button
                            className="icon-button delete-action"
                            onClick={() => onDelete(file)}
                            aria-label="Delete"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">Showing {files.length} documents</div>
          </div>
          <div
            className={`dropzone ${dragging ? "dropzone-active" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") inputRef.current?.click();
            }}
          >
            <span className="drop-icon">
              <Upload size={20} />
            </span>
            <strong>Drop files here to upload</strong>
            <span>
              or <u>browse from your device</u>
            </span>
            <small>PDF, PNG, JPG · Up to 20 MB per file</small>
          </div>
        </div>
        <aside className="file-sidebar">
          <div className="panel file-status-panel">
            <h3>Review status</h3>
            <p>Document verification overview</p>
            {(["Pending Review", "Verified", "Rejected"] as const).map(
              (status) => (
                <div className="status-count-row" key={status}>
                  <span
                    className={`status-indicator indicator-${status.toLowerCase().replace(" ", "-")}`}
                  />
                  {status}
                  <strong>
                    {files.filter((file) => file.status === status).length}
                  </strong>
                </div>
              ),
            )}
          </div>
          <div className="privacy-note">
            <ShieldCheck size={18} />
            <div>
              <strong>Documents are private</strong>
              <p>
                Only members with access to this application can view its files.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function TeamDirectory({ role }: { role: Role }) {
  return (
    <>
      <PageHeading
        eyebrow="PEOPLE & PERMISSIONS"
        title="Team directory"
        description="Manage staff access and view client records across your workspace."
        action={
          role === "Admin" && (
            <button
              className="button button-primary"
              onClick={() =>
                window.alert(
                  "Invite flow is ready for your identity provider integration.",
                )
              }
            >
              <Plus size={16} /> Invite member
            </button>
          )
        }
      />
      <section className="panel directory-panel">
        <div className="list-toolbar">
          <label className="list-search">
            <Search size={16} />
            <input placeholder="Search people..." />
          </label>
          <button className="button button-quiet">
            <Filter size={16} /> All roles <ChevronDown size={14} />
          </button>
          <span className="toolbar-count">{people.length} members</span>
        </div>
        <div className="table-wrap">
          <table className="data-table full-table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>ROLE</th>
                <th>APPLICATIONS</th>
                <th>STATUS</th>
                <th>PERMISSIONS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {people.map((person, index) => (
                <tr key={person.email}>
                  <td>
                    <div className="client-cell">
                      <span
                        className={`avatar ${index % 2 ? "avatar-blue" : "avatar-green"}`}
                      >
                        {person.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge tone={person.role === "Staff" ? "blue" : "neutral"}>
                      {person.role}
                    </Badge>
                  </td>
                  <td>{person.cases}</td>
                  <td>
                    <Badge tone="green">{person.state}</Badge>
                  </td>
                  <td>
                    {person.role === "Staff"
                      ? "Case management"
                      : "Own applications"}
                  </td>
                  <td>
                    <button
                      className="icon-button row-more"
                      aria-label={`Manage ${person.name}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="permission-note">
        <LockKeyhole size={17} />
        <span>
          Role permissions are demo controls only. Enforce authorization on the
          server before handling real client data.
        </span>
      </div>
    </>
  );
}

function AuditLog({ activity }: { activity: typeof initialActivity }) {
  return (
    <>
      <PageHeading
        eyebrow="COMPLIANCE"
        title="Audit log"
        description="A chronological record of actions across your migration workspace."
        action={
          <button
            className="button button-quiet"
            onClick={() => window.print()}
          >
            <ArrowDownToLine size={16} /> Export log
          </button>
        }
      />
      <section className="panel directory-panel">
        <div className="audit-filters">
          <label className="list-search">
            <Search size={16} />
            <input placeholder="Search activity..." />
          </label>
          <button className="button button-quiet">
            <CalendarDays size={15} /> Last 30 days <ChevronDown size={14} />
          </button>
          <button className="button button-quiet">
            <Filter size={15} /> All actions
          </button>
        </div>
        <div className="audit-list">
          {activity.map((item, index) => (
            <div className="audit-row" key={`${item.title}-${index}`}>
              <span className="audit-mark">
                <ClipboardCheck size={16} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              <time>{item.time}</time>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Settings({
  dark,
  setDark,
  role,
  onNotice,
}: {
  dark: boolean;
  setDark: (value: boolean) => void;
  role: Role;
  onNotice: (message: string) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE PREFERENCES"
        title="Settings"
        description="Configure workspace appearance and regional preferences."
      />
      <div className="settings-layout">
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h2>Appearance</h2>
              <p>Personalize your workspace.</p>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-icon">
              <Sun size={17} />
            </div>
            <div>
              <strong>Color theme</strong>
              <small>Choose a light or dark workspace.</small>
            </div>
            <div className="theme-segment">
              <button
                className={!dark ? "selected" : ""}
                onClick={() => setDark(false)}
              >
                <Sun size={15} /> Light
              </button>
              <button
                className={dark ? "selected" : ""}
                onClick={() => setDark(true)}
              >
                <Moon size={15} /> Dark
              </button>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-icon">
              <Globe2 size={17} />
            </div>
            <div>
              <strong>Language & region</strong>
              <small>Dates and number formatting.</small>
            </div>
            <select className="setting-select" defaultValue="English (US)">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>French</option>
            </select>
          </div>
          <div className="setting-row">
            <div className="setting-icon">
              <Bell size={17} />
            </div>
            <div>
              <strong>Email notifications</strong>
              <small>Receive case updates and review reminders.</small>
            </div>
            <Toggle defaultOn />
          </div>
        </section>
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h2>Workspace profile</h2>
              <p>Brand identity shown across internal documents.</p>
            </div>
            <Badge tone={role === "Admin" ? "green" : "amber"}>
              {role} access
            </Badge>
          </div>
          <label className="field-label">
            ORGANIZATION NAME
            <input defaultValue="Global Migration Hub" />
          </label>
          <label className="field-label">
            SUPPORT EMAIL
            <input defaultValue="support@globalmigrationhub.com" />
          </label>
          <button
            className="button button-primary"
            onClick={() => onNotice("Workspace preferences saved")}
          >
            Save changes
          </button>
        </section>
      </div>
    </>
  );
}

function Security({
  role,
  twoFactor,
  setTwoFactor,
  biometric,
  setBiometric,
  isSignup,
  setIsSignup,
  onNotice,
}: {
  role: Role;
  twoFactor: boolean;
  setTwoFactor: (value: boolean) => void;
  biometric: boolean;
  setBiometric: (value: boolean) => void;
  isSignup: boolean;
  setIsSignup: (value: boolean) => void;
  onNotice: (message: string) => void;
}) {
  const [recovery, setRecovery] = useState(false);
  const [mockAuth, setMockAuth] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMockAuth(true);
    onNotice(
      isSignup ? `${role} demo account created` : "Demo sign-in complete",
    );
  };
  return (
    <>
      <PageHeading
        eyebrow="IDENTITY & ACCESS"
        title="Access & security"
        description="Demo authentication controls and workspace account preferences."
      />
      <div className="security-layout">
        <section className="panel auth-panel">
          <div className="auth-panel-header">
            <span className="auth-lock">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2>
                {recovery
                  ? "Reset your password"
                  : isSignup
                    ? `Create ${role.toLowerCase()} account`
                    : `${role} sign in`}
              </h2>
              <p>
                {recovery
                  ? "We’ll send a reset link to your email."
                  : "Mock authentication for this local demo workspace."}
              </p>
            </div>
          </div>
          {!recovery && (
            <div className="auth-tabs">
              <button
                className={!isSignup ? "selected" : ""}
                onClick={() => setIsSignup(false)}
              >
                Sign in
              </button>
              <button
                className={isSignup ? "selected" : ""}
                onClick={() => setIsSignup(true)}
              >
                Create account
              </button>
            </div>
          )}
          <form className="modal-form" onSubmit={submit}>
            {isSignup && !recovery && (
              <label>
                FULL NAME
                <input required placeholder="Your full name" />
              </label>
            )}
            <label>
              EMAIL ADDRESS
              <input required type="email" placeholder="name@example.com" />
            </label>
            {!recovery && (
              <label>
                PASSWORD
                <input
                  required
                  type="password"
                  placeholder="At least 8 characters"
                  minLength={8}
                />
              </label>
            )}
            {isSignup && (
              <label>
                ACCOUNT ROLE
                <select
                  value={role}
                  onChange={(event) => {
                    if (event.target.value === "Admin" && role !== "Admin")
                      onNotice(
                        "Admin registration must be approved by an existing administrator",
                      );
                  }}
                >
                  <option>Client</option>
                  <option>Staff</option>
                  <option>Admin</option>
                </select>
              </label>
            )}
            {!recovery && twoFactor && (
              <label>
                AUTHENTICATOR CODE
                <input
                  inputMode="numeric"
                  placeholder="123 456"
                  maxLength={7}
                />
              </label>
            )}
            <button className="button button-primary auth-submit">
              {recovery
                ? "Send reset link"
                : isSignup
                  ? "Create account"
                  : "Sign in"}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
          {!recovery && !isSignup && (
            <button
              className="text-button forgot-link"
              onClick={() => setRecovery(true)}
            >
              Forgot password?
            </button>
          )}
          {recovery && (
            <button
              className="text-button forgot-link"
              onClick={() => setRecovery(false)}
            >
              Back to sign in
            </button>
          )}
          {mockAuth && (
            <p className="demo-auth-result">
              <BadgeCheck size={15} /> Demo flow completed. No real session was
              issued.
            </p>
          )}
        </section>
        <section className="panel security-options">
          <div className="panel-heading">
            <div>
              <h2>Sign-in protection</h2>
              <p>Additional account security options.</p>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-icon">
              <LockKeyhole size={17} />
            </div>
            <div>
              <strong>Two-factor authentication</strong>
              <small>Require a one-time code during sign in.</small>
            </div>
            <Toggle checked={twoFactor} onChange={setTwoFactor} />
          </div>
          <div className="setting-row">
            <div className="setting-icon">
              <Fingerprint size={17} />
            </div>
            <div>
              <strong>Biometric sign in</strong>
              <small>Use your device biometrics when supported.</small>
            </div>
            <Toggle checked={biometric} onChange={setBiometric} />
          </div>
          <div className="security-footnote">
            <ShieldCheck size={16} />
            <span>
              Production authentication requires a server-managed identity
              provider, signed sessions, and server-side role checks.
            </span>
          </div>
        </section>
      </div>
    </>
  );
}

function Toggle({
  checked,
  onChange,
  defaultOn = false,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  defaultOn?: boolean;
}) {
  const [local, setLocal] = useState(Boolean(checked ?? defaultOn));
  const active = onChange ? Boolean(checked) : local;
  return (
    <button
      type="button"
      className={`toggle ${active ? "toggle-on" : ""}`}
      aria-pressed={active}
      onClick={() => (onChange ? onChange(!active) : setLocal(!local))}
    >
      <span />
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        className={`modal-card ${wide ? "modal-wide" : ""}`}
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
