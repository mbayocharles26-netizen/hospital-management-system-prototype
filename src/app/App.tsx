import { useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  Pencil,
  Phone,
  Search,
  Settings,
  Settings2,
  ShieldCheck,
  Stethoscope,
  Sun,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */

type Screen = "login" | "register" | "dashboard" | "doctors" | "booking" | "confirmation" | "profile" | "notifications" | "settings";
type AdminScreen = "admin-login" | "admin";
type AdminTab = "overview" | "doctors" | "patients" | "appointments" | "settings";
type AppMode = "patient" | "admin";
type DoctorStatus = "pending" | "approved" | "rejected";

interface RegisteredDoctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  licenseNo: string;
  hospital: string;
  experience: string;
  joinedDate: string;
  status: DoctorStatus;
}

/* ── Static data ───────────────────────────────────────── */

const PATIENT = {
  name: "Francis Charles Mbayo",
  firstName: "Francis",
  age: 20,
  email: "mbayocharles26@gmail.com",
  id: "RW-2026-420",
  bloodType: "A+",
  lastVisit: "15 June 2026",
};

const DOCTORS_DATA: {
  id: number; name: string; specialty: string; rating: string; next: string;
  room: string; color: string; status: string; patients: number; joined: string;
  todayAppts: number; available: boolean; email: string; phone: string;
  licenseNo: string; experience: string;
}[] = [];

const PATIENTS_DATA = [
  { id: "RW-2026-420", name: "Francis Charles Mbayo", age: 20, email: "mbayocharles26@gmail.com", status: "active", visits: 3, lastVisit: "15 Jun 2026" },
];

const APPOINTMENTS_DATA: {
  id: string; patient: string; doctor: string; room: string; time: string;
  date: string; type: string; status: string;
}[] = [];

const CHART_DATA = [
  { day: "Mon", appointments: 38 },
  { day: "Tue", appointments: 52 },
  { day: "Wed", appointments: 45 },
  { day: "Thu", appointments: 61 },
  { day: "Fri", appointments: 48 },
  { day: "Sat", appointments: 29 },
  { day: "Sun", appointments: 14 },
];

const SPECIALTIES = ["Cardiology", "General Medicine", "Pediatrics", "Orthopedics", "Dermatology", "Neurology", "Gynecology", "Oncology", "Radiology", "Psychiatry"];

const patientNavItems: { id: Screen; label: string; icon: ElementType }[] = [
  { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { id: "doctors",       label: "Doctors",       icon: Stethoscope },
  { id: "booking",       label: "Booking",       icon: CalendarCheck },
  { id: "profile",       label: "Records",       icon: FileText },
  { id: "notifications", label: "Alerts",        icon: Bell },
  { id: "settings",      label: "Settings",      icon: Settings2 },
];

const adminNavItems: { id: AdminTab; label: string; icon: ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "patients", label: "Patients", icon: Users },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

/* ── Root App ──────────────────────────────────────────── */

function App() {
  const [mode, setMode] = useState<AppMode>("patient");
  const [screen, setScreen] = useState<Screen>("login");
  const [adminScreen, setAdminScreen] = useState<AdminScreen>("admin-login");
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS_DATA[number] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("10:30");

  const step = useMemo(() => ["login", "dashboard", "doctors", "booking", "confirmation", "profile"].indexOf(screen), [screen]);
  const progressClass = ["w-[16%]", "w-[32%]", "w-[48%]", "w-[64%]", "w-[80%]", "w-full"][Math.max(0, step)];

  const [registeredDoctors, setRegisteredDoctors] = useState<RegisteredDoctor[]>([
    {
      id: "REG-001",
      name: "Dr. Dabanica Payne",
      specialty: "General Medicine",
      email: "Doctor@#26@gmail.com",
      phone: "+250 788 300 001",
      licenseNo: "KGL-MED-2026-0201",
      hospital: "Hospital Kigali",
      experience: "6",
      joinedDate: "Jun 2026",
      status: "approved",
    },
  ]);
  const [doctorStatuses, setDoctorStatuses] = useState<Record<number, string>>(
    Object.fromEntries(DOCTORS_DATA.map(d => [d.id, d.status]))
  );

  const [loggedInDoctor, setLoggedInDoctor] = useState<RegisteredDoctor | null>(null);
  const [isDark, setIsDark] = useState(false);
  const toggleDark = () => setIsDark(d => !d);

  const go = (next: Screen) => setScreen(next);
  const goAdmin = (next: AdminScreen) => setAdminScreen(next);
  const logout = () => { setScreen("login"); setLoggedInDoctor(null); };
  const isPatientShell = screen !== "login" && screen !== "register";

  const addRegisteredDoctor = (doc: RegisteredDoctor) =>
    setRegisteredDoctors(prev => [...prev, doc]);

  const updateRegisteredDoctorStatus = (id: string, status: DoctorStatus) =>
    setRegisteredDoctors(prev => prev.map(d => d.id === id ? { ...d, status } : d));

  const approveDoctor = (id: number) => setDoctorStatuses(s => ({ ...s, [id]: "approved" }));
  const revokeDoctor  = (id: number) => setDoctorStatuses(s => ({ ...s, [id]: "rejected" }));

  // Doctors the patient can see: static approved + newly approved registered
  const patientVisibleDoctors = [
    ...DOCTORS_DATA.filter(d => doctorStatuses[d.id] === "approved"),
    ...registeredDoctors
      .filter(d => d.status === "approved")
      .map((d, i) => ({
        id: 1000 + i,
        name: d.name,
        specialty: d.specialty,
        rating: "New",
        next: "Today, TBD",
        room: d.hospital,
        color: "bg-violet-100 text-violet-700",
        status: "approved" as const,
        patients: 0,
        joined: d.joinedDate,
        todayAppts: 0,
        available: true,
        email: d.email,
        phone: d.phone,
        licenseNo: d.licenseNo,
        experience: d.experience,
      })),
  ];

  /* Doctor portal */
  if (loggedInDoctor) {
    return (
      <div className={`min-h-svh bg-background text-foreground [font-family:'Instrument_Sans',sans-serif] ${isDark ? "dark" : ""}`}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(12,183,163,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.14),transparent_30%)]" />
        <DoctorPortal doctor={loggedInDoctor} onLogout={logout} isDark={isDark} toggleDark={toggleDark} />
      </div>
    );
  }

  /* Admin portal */
  if (mode === "admin") {
    return (
      <div className={`min-h-svh bg-background text-foreground [font-family:'Instrument_Sans',sans-serif] ${isDark ? "dark" : ""}`}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(12,183,163,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.14),transparent_30%)]" />
        <motion.div key={adminScreen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.24 }}>
          {adminScreen === "admin-login" && (
            <AdminLogin
              onEnter={() => goAdmin("admin")}
              onBack={() => { setMode("patient"); setScreen("login"); }}
            />
          )}
          {adminScreen === "admin" && (
            <AdminPortal
              onLogout={() => { setMode("patient"); setScreen("login"); setAdminScreen("admin-login"); }}
              registeredDoctors={registeredDoctors}
              onUpdateDoctorStatus={updateRegisteredDoctorStatus}
              doctorStatuses={doctorStatuses}
              onApproveDoctor={approveDoctor}
              onRevokeDoctor={revokeDoctor}
            />
          )}
        </motion.div>
      </div>
    );
  }

  /* Patient portal */
  return (
    <div className={`min-h-svh bg-background text-foreground [font-family:'Instrument_Sans',sans-serif] ${isDark ? "dark" : ""}`}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(12,183,163,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.14),transparent_30%)]" />

      {!isPatientShell && (
        <div className="flex min-h-svh items-center justify-center p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card/95 shadow-2xl shadow-slate-200/70">
            <motion.div key={screen} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}>
              {screen === "login" && (
                <Login
                  onEnter={() => go("dashboard")}
                  onDoctorEnter={(doc) => setLoggedInDoctor(doc)}
                  onRegister={() => go("register")}
                  onAdmin={() => setMode("admin")}
                  registeredDoctors={registeredDoctors}
                />
              )}
              {screen === "register" && (
                <Register
                  onSuccess={() => go("dashboard")}
                  onBack={() => go("login")}
                  onDoctorRegister={(doc) => { addRegisteredDoctor(doc); go("login"); }}
                />
              )}
            </motion.div>
          </div>
        </div>
      )}

      {isPatientShell && (
        <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col p-3 pb-20 sm:p-4 sm:pb-24 lg:grid lg:grid-cols-[260px_1fr] lg:gap-6 lg:p-8 lg:pb-8">
          <aside className="hidden rounded-[2rem] border border-border bg-card/90 p-5 shadow-xl shadow-slate-200/60 lg:flex lg:flex-col lg:self-start lg:sticky lg:top-8">
            <Brand />
            <nav className="mt-10 space-y-2">
              {patientNavItems.map((item) => (
                <NavButton key={item.id} item={item} active={screen === item.id} onClick={() => go(item.id)} />
              ))}
            </nav>
            <div className="mt-10 rounded-3xl bg-primary p-5 text-primary-foreground">
              <ShieldCheck className="mb-5 size-8" />
              <p className="text-sm font-semibold">Prototype status</p>
              <p className="mt-2 text-sm text-white/75">6 high-fidelity linked screens with transitions and accessible controls.</p>
            </div>
            {/* Sidebar dark toggle */}
            <div className="mt-6">
              <button onClick={toggleDark} className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary">
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
            </div>
            {/* Sidebar logout */}
            <div className="mt-3 border-t border-border pt-5">
              <div className="mb-3 flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3">
                <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <UserRound className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{PATIENT.firstName}</p>
                  <p className="truncate text-xs text-muted-foreground">{PATIENT.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-destructive"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </div>
          </aside>

          <section className="overflow-hidden rounded-[2rem] border border-border bg-card/95 shadow-2xl shadow-slate-200/70">
            <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
              <div className="lg:hidden"><Brand compact /></div>
              <div className="hidden lg:block">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">{PATIENT.name} · Patient Journey</p>
                <div className="mt-2 h-1.5 w-72 rounded-full bg-muted">
                  <div className={`h-full rounded-full bg-accent transition-all duration-500 ${progressClass}`} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Dark mode toggle */}
                <button onClick={toggleDark} title={isDark ? "Light mode" : "Dark mode"} className="relative flex size-9 items-center justify-center rounded-2xl border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:size-10">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={isDark ? "moon" : "sun"} initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 30 }} transition={{ duration: 0.18 }} className="absolute">
                      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </motion.span>
                  </AnimatePresence>
                </button>
                {/* Notification bell */}
                <button onClick={() => go("notifications")} title="Notifications" className="relative flex size-9 items-center justify-center rounded-2xl border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:size-10">
                  <Bell className="size-4" />
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                </button>
                <button onClick={() => go("profile")} className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2.5 text-sm text-secondary-foreground transition hover:bg-muted sm:px-4 sm:py-3 lg:gap-3">
                  <UserRound className="size-4 sm:size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                <button onClick={logout} title="Log out" className="flex items-center gap-2 rounded-2xl border border-border px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-destructive sm:px-4 sm:py-3 lg:hidden">
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            </header>

            <motion.div key={screen} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }} className="p-4 sm:p-6 lg:p-8">
              {screen === "dashboard"     && <Dashboard go={go} />}
              {screen === "doctors"       && <DoctorList doctors={patientVisibleDoctors} setSelectedDoctor={setSelectedDoctor} go={go} />}
              {screen === "booking"       && selectedDoctor && <Booking doctor={selectedDoctor} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot} go={go} />}
              {screen === "confirmation"  && selectedDoctor && <Confirmation doctor={selectedDoctor} slot={selectedSlot} go={go} />}
              {screen === "profile"       && <Profile go={go} />}
              {screen === "notifications" && <Notifications go={go} />}
              {screen === "settings"      && <PatientSettings isDark={isDark} toggleDark={toggleDark} go={go} />}
            </motion.div>
          </section>
        </div>
      )}

      {isPatientShell && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
          <div className="flex">
            {patientNavItems.map((item) => {
              const Icon = item.icon;
              const active = screen === item.id;
              return (
                <button key={item.id} onClick={() => go(item.id)} className={`relative flex flex-1 flex-col items-center gap-1 px-1 py-3 text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <Icon className={`size-5 transition-transform ${active ? "scale-110" : ""}`} />
                  <span>{item.label}</span>
                  {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

/* ── Admin Login ───────────────────────────────────────── */

const ADMIN_EMAIL    = "mbayocharles26@gmail.com";
const ADMIN_PASSWORD = "ADMIN2026";

function AdminLogin({ onEnter, onBack }: { onEnter: () => void; onBack: () => void }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = () => {
    if (!email.trim())  { setError("Please enter your admin email."); return; }
    if (!password)      { setError("Please enter your password."); return; }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      setError("Invalid credentials. Please check your email and password.");
      return;
    }
    setError("");
    onEnter();
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to patient portal
        </button>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-slate-200/70">
          <div className="bg-primary p-6 sm:p-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/15">
              <ShieldCheck className="size-6 text-primary-foreground" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-primary-foreground sm:text-3xl">Admin Portal</h1>
            <p className="mt-2 text-sm text-primary-foreground/70">Hospital Kigali · MediBridge Management System</p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground">Admin email</label>
                <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-secondary px-4 py-3.5 focus-within:border-primary transition ${error && !email.trim() ? "border-destructive" : "border-border"}`}>
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="Enter admin email"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground">Password</label>
                <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-secondary px-4 py-3.5 focus-within:border-primary transition ${error && !password ? "border-destructive" : "border-border"}`}>
                  <LockKeyhole className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter password"
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                  <button onClick={() => setShowPw(!showPw)} className="text-muted-foreground transition hover:text-foreground">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <X className="size-3.5" /> {error}
                </p>
              )}
            </div>
            <button onClick={handleLogin} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-bold text-primary-foreground transition hover:brightness-95">
              Access admin dashboard <ChevronRight className="size-5" />
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">Authorised personnel only · All actions are logged</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Portal ──────────────────────────────────────── */

function AdminPortal({ onLogout, registeredDoctors, onUpdateDoctorStatus, doctorStatuses, onApproveDoctor, onRevokeDoctor }: {
  onLogout: () => void;
  registeredDoctors: RegisteredDoctor[];
  onUpdateDoctorStatus: (id: string, status: DoctorStatus) => void;
  doctorStatuses: Record<number, string>;
  onApproveDoctor: (id: number) => void;
  onRevokeDoctor: (id: number) => void;
}) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appts, setAppts] = useState(APPOINTMENTS_DATA);

  const pendingDoctors = Object.values(doctorStatuses).filter(s => s === "pending").length
    + registeredDoctors.filter(d => d.status === "pending").length;
  const approveDoctor = onApproveDoctor;
  const rejectDoctor  = onRevokeDoctor;
  const cancelAppt    = (id: string) => setAppts(a => a.map(x => x.id === id ? { ...x, status: "cancelled" } : x));
  const confirmAppt   = (id: string) => setAppts(a => a.map(x => x.id === id ? { ...x, status: "confirmed" } : x));

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary">
              <ShieldCheck className="size-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">MediBridge</p>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground lg:hidden"><X className="size-5" /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Icon className="size-4 shrink-0" />
                {item.label}
                {item.id === "doctors" && pendingDoctors > 0 && (
                  <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{pendingDoctors}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">AD</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Admin User</p>
              <p className="truncate text-xs text-muted-foreground">mbayocharles26@gmail.com</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-destructive">
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-border p-2 text-muted-foreground transition hover:text-foreground lg:hidden">
              <LayoutDashboard className="size-5" />
            </button>
            <div>
              <h2 className="text-base font-bold capitalize sm:text-lg">{tab === "overview" ? "Dashboard Overview" : tab}</h2>
              <p className="hidden text-xs text-muted-foreground sm:block">Hospital Kigali · 28 June 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="relative rounded-xl border border-border p-2 text-muted-foreground transition hover:text-foreground">
              <Bell className="size-5" />
              {pendingDoctors > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-amber-500" />}
            </button>
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 sm:flex">
              <div className="grid size-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">AD</div>
              <span className="text-sm">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            {tab === "overview"      && <AdminOverview pendingDoctors={pendingDoctors + registeredDoctors.filter(d => d.status === "pending").length} appts={appts} doctorStatuses={doctorStatuses} setTab={setTab} />}
            {tab === "doctors"       && <AdminDoctors doctorStatuses={doctorStatuses} approve={approveDoctor} reject={rejectDoctor} registeredDoctors={registeredDoctors} onUpdateDoctorStatus={onUpdateDoctorStatus} />}
            {tab === "patients"      && <AdminPatients />}
            {tab === "appointments"  && <AdminAppointments appts={appts} cancel={cancelAppt} confirm={confirmAppt} />}
            {tab === "settings"      && <AdminSettings />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

/* ── Admin tabs ────────────────────────────────────────── */

function AdminOverview({ pendingDoctors, appts, doctorStatuses, setTab }: {
  pendingDoctors: number;
  appts: typeof APPOINTMENTS_DATA;
  doctorStatuses: Record<number, string>;
  setTab: (t: AdminTab) => void;
}) {
  const activeDocCount  = DOCTORS_DATA.filter(d => doctorStatuses[d.id] === "approved").length;
  const pendingAppts    = appts.filter(a => a.status === "pending").length;
  const confirmedAppts  = appts.filter(a => a.status === "confirmed").length;

  const stats = [
    { label: "Total patients",        value: String(PATIENTS_DATA.length),  delta: "+1 registered today",              icon: Users,         iconClass: "bg-sky-100 text-sky-600" },
    { label: "Active doctors",         value: String(activeDocCount),         delta: `${pendingDoctors} pending review`, icon: Stethoscope,   iconClass: "bg-emerald-100 text-emerald-600" },
    { label: "Today's appointments",   value: String(appts.length),           delta: `${pendingAppts} pending confirm`,  icon: CalendarCheck, iconClass: "bg-primary/10 text-primary" },
    { label: "Confirmed today",        value: String(confirmedAppts),         delta: "↓ 2 min avg queue time",          icon: Clock3,        iconClass: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className={`inline-flex size-9 items-center justify-center rounded-xl sm:size-10 ${s.iconClass}`}>
                <Icon className="size-4 sm:size-5" />
              </div>
              <p className="mt-3 text-xl font-extrabold sm:mt-4 sm:text-2xl">{s.value}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">{s.label}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">{s.delta}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Chart */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Appointments this week</h3>
              <p className="text-sm text-muted-foreground">Total: 287 · up 14% vs last week</p>
            </div>
            <TrendingUp className="size-5 text-emerald-600" />
          </div>
          <div className="mt-5 h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} barSize={28}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis key="xaxis" dataKey="day" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis key="yaxis" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip key="tooltip" contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, color: "#111827" }} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
                <Bar key="bar-appointments" dataKey="appointments" fill="#030213" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts + activity */}
        <div className="space-y-4">
          {pendingDoctors > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">{pendingDoctors} doctor verification{pendingDoctors > 1 ? "s" : ""} pending</p>
                  <p className="mt-1 text-xs text-amber-600">New registrations need approval before going live.</p>
                </div>
              </div>
              <button onClick={() => setTab("doctors")} className="mt-3 w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-400">
                Review now
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold">Recent activity</h3>
            <div className="mt-4 space-y-3">
              {[
                { text: "Francis C. Mbayo account created",   time: "2 min ago",  color: "bg-emerald-500" },
                { text: "Francis C. Mbayo profile updated",   time: "30 min ago", color: "bg-sky-500" },
                { text: "Hospital settings saved by admin",   time: "1 hr ago",   color: "bg-primary" },
                { text: "New doctor registration received",   time: "3 hrs ago",  color: "bg-amber-500" },
              ].map((a) => (
                <div key={a.text} className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${a.color}`} />
                  <div>
                    <p className="text-sm">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDoctors({ doctorStatuses, approve, reject, registeredDoctors, onUpdateDoctorStatus }: {
  doctorStatuses: Record<number, string>;
  approve: (id: number) => void;
  reject:  (id: number) => void;
  registeredDoctors: RegisteredDoctor[];
  onUpdateDoctorStatus: (id: string, status: DoctorStatus) => void;
}) {
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [query, setQuery]   = useState("");
  const [clock, setClock]   = useState(() => new Date());
  const [flash, setFlash]   = useState<Record<number, "approved" | "rejected">>({});

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const doApprove = (id: number) => {
    approve(id);
    setFlash(f => ({ ...f, [id]: "approved" }));
    setTimeout(() => setFlash(f => { const n = { ...f }; delete n[id]; return n; }), 2500);
  };
  const doReject = (id: number) => {
    reject(id);
    setFlash(f => ({ ...f, [id]: "rejected" }));
    setTimeout(() => setFlash(f => { const n = { ...f }; delete n[id]; return n; }), 2500);
  };

  const allStaticStatuses  = Object.values(doctorStatuses);
  const allRegStatuses     = registeredDoctors.map(d => d.status);
  const allStatuses        = [...allStaticStatuses, ...allRegStatuses];

  const counts = {
    all:      DOCTORS_DATA.length + registeredDoctors.length,
    approved: allStatuses.filter(s => s === "approved").length,
    pending:  allStatuses.filter(s => s === "pending").length,
    rejected: allStatuses.filter(s => s === "rejected").length,
  };

  const q = query.toLowerCase();

  const visibleStatic = DOCTORS_DATA.filter(d => {
    const statusMatch = filter === "all" || doctorStatuses[d.id] === filter;
    const textMatch   = !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.licenseNo.toLowerCase().includes(q);
    return statusMatch && textMatch;
  });

  const visibleReg = registeredDoctors.filter(d => {
    const statusMatch = filter === "all" || d.status === filter;
    const textMatch   = !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.licenseNo.toLowerCase().includes(q);
    return statusMatch && textMatch;
  });

  const timeStr = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const statusBadge: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending:  "bg-amber-100  text-amber-700  border-amber-200",
    rejected: "bg-red-100    text-red-700    border-red-200",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Doctor Management</h3>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Sunday, 28 June 2026 · <span className="font-mono">{timeStr}</span></p>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary transition sm:w-64">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, specialty, license…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          {query && <button onClick={() => setQuery("")}><X className="size-4 text-muted-foreground" /></button>}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total",    value: counts.all,      cls: "border-border bg-card text-foreground" },
          { label: "Active",   value: counts.approved,  cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
          { label: "Pending",  value: counts.pending,   cls: "border-amber-200  bg-amber-50  text-amber-700" },
          { label: "Rejected", value: counts.rejected,  cls: "border-red-200    bg-red-50    text-red-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border px-4 py-3 ${s.cls}`}>
            <p className="text-2xl font-extrabold leading-none">{s.value}</p>
            <p className="mt-1 text-xs font-medium opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 rounded-xl border border-border bg-secondary p-1">
        {(["all", "approved", "pending", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${filter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Doctor cards */}
      {visibleStatic.length === 0 && visibleReg.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">No doctors match your filter.</div>
      ) : (
        <div className="space-y-3">
          {/* Static hospital doctors */}
          {visibleStatic.map((doc) => {
            const status   = doctorStatuses[doc.id];
            const flashMsg = flash[doc.id];
            return (
              <div key={doc.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                {flashMsg && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={`mb-3 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${flashMsg === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600"}`}>
                    {flashMsg === "approved" ? <BadgeCheck className="size-4" /> : <XCircle className="size-4" />}
                    {flashMsg === "approved" ? `${doc.name} has been approved and is now active.` : `${doc.name}'s registration has been rejected.`}
                  </motion.div>
                )}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`grid size-12 shrink-0 place-items-center rounded-2xl sm:size-14 ${doc.color}`}><Stethoscope className="size-5 sm:size-6" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold">{doc.name}</h4>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${statusBadge[status]}`}>{status}</span>
                        {status === "approved" && (
                          <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${doc.available ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-secondary text-muted-foreground"}`}>
                            <span className={`size-1.5 rounded-full ${doc.available ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                            {doc.available ? "Available now" : "In session"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{doc.specialty} · License {doc.licenseNo}</p>
                      {status === "approved" && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>📍 {doc.room}</span><span>★ {doc.rating} rating</span><span>{doc.patients} total patients</span><span>{doc.todayAppts} appts today</span><span>Joined {doc.joined}</span>
                        </div>
                      )}
                      {status === "rejected" && <p className="mt-1 text-xs text-muted-foreground">✉ {doc.email}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:shrink-0 lg:flex-col lg:items-end">
                    {status === "approved" && (
                      <button onClick={() => doReject(doc.id)} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                        <X className="size-4" /> Revoke access
                      </button>
                    )}
                    {status === "rejected" && (
                      <button onClick={() => doApprove(doc.id)} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                        <BadgeCheck className="size-4" /> Re-approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Newly registered doctors awaiting approval */}
          {visibleReg.map((doc) => (
            <div key={doc.id} className={`rounded-2xl border p-4 sm:p-5 ${doc.status === "pending" ? "border-amber-200 bg-amber-50/50" : "border-border bg-card"}`}>
              {doc.status === "pending" && (
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">
                  <AlertCircle className="size-4 shrink-0" /> New registration — awaiting your approval before this doctor can log in
                </div>
              )}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700 sm:size-14"><Stethoscope className="size-5 sm:size-6" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold">{doc.name}</h4>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${statusBadge[doc.status]}`}>{doc.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{doc.specialty} · License {doc.licenseNo}</p>
                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                      <span>🏥 {doc.hospital}</span>
                      <span>📋 {doc.experience} yrs exp.</span>
                      <span>✉ {doc.email}</span>
                      <span>📞 {doc.phone}</span>
                      <span>Submitted: {doc.joinedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:shrink-0 lg:flex-col lg:items-end">
                  {doc.status === "pending" && (
                    <>
                      <button onClick={() => onUpdateDoctorStatus(doc.id, "approved")} className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-200">
                        <BadgeCheck className="size-4" /> Approve
                      </button>
                      <button onClick={() => onUpdateDoctorStatus(doc.id, "rejected")} className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-200">
                        <XCircle className="size-4" /> Reject
                      </button>
                    </>
                  )}
                  {doc.status === "approved" && (
                    <button onClick={() => onUpdateDoctorStatus(doc.id, "rejected")} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                      <X className="size-4" /> Revoke access
                    </button>
                  )}
                  {doc.status === "rejected" && (
                    <button onClick={() => onUpdateDoctorStatus(doc.id, "approved")} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                      <BadgeCheck className="size-4" /> Re-approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPatients() {
  const [query, setQuery] = useState("");
  const filtered = PATIENTS_DATA.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.email.toLowerCase().includes(query.toLowerCase()) ||
    p.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold">Patient Records</h3>
          <p className="text-sm text-muted-foreground">{PATIENTS_DATA.length} registered patients</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 focus-within:border-primary transition sm:w-72">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email or ID…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          {query && <button onClick={() => setQuery("")}><X className="size-4 text-muted-foreground" /></button>}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="hidden grid-cols-[1fr_80px_120px_80px_100px] gap-4 bg-secondary px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Patient</span><span>Age</span><span>Last visit</span><span>Visits</span><span>Status</span>
        </div>
        <div className="divide-y divide-border bg-card">
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No patients match your search.</div>
          )}
          {filtered.map((p) => (
            <div key={p.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_80px_120px_80px_100px] sm:items-center sm:gap-4 sm:px-5 sm:py-3">
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.id} · {p.email}</p>
              </div>
              <span className="text-sm text-muted-foreground">{p.age}</span>
              <span className="text-sm text-muted-foreground">{p.lastVisit}</span>
              <span className="text-sm text-muted-foreground">{p.visits}</span>
              <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${p.status === "active" ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-border bg-secondary text-muted-foreground"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminAppointments({ appts, cancel, confirm }: {
  appts: typeof APPOINTMENTS_DATA;
  cancel: (id: string) => void;
  confirm: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const statusStyle: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending:   "bg-amber-100  text-amber-700  border-amber-200",
    cancelled: "bg-red-100    text-red-600    border-red-200",
  };

  const counts = {
    all:       appts.length,
    confirmed: appts.filter(a => a.status === "confirmed").length,
    pending:   appts.filter(a => a.status === "pending").length,
    cancelled: appts.filter(a => a.status === "cancelled").length,
  };

  const visible = appts.filter(a => {
    const matchesFilter = filter === "all" || a.status === filter;
    const q = query.toLowerCase();
    const matchesQuery = !q || a.patient.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  const timeStr = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // determine if an appointment slot has passed (before current wall-clock time)
  const isPast = (apptTime: string) => {
    const [h, m] = apptTime.split(":").map(Number);
    const now = clock;
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
  };

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Appointments</h3>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Sunday, 28 June 2026 · <span className="font-mono">{timeStr}</span></p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary transition sm:w-64">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Patient, doctor, ID…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          {query && <button onClick={() => setQuery("")}><X className="size-4 text-muted-foreground" /></button>}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "confirmed", "pending", "cancelled"] as const).map(f => {
          const tabStyle: Record<string, string> = {
            all:       filter === f ? "bg-primary text-primary-foreground border-primary"         : "border-border text-muted-foreground hover:text-foreground",
            confirmed: filter === f ? "bg-emerald-100 text-emerald-700 border-emerald-300"        : "border-border text-muted-foreground hover:border-emerald-200 hover:text-emerald-700",
            pending:   filter === f ? "bg-amber-100  text-amber-700   border-amber-300"           : "border-border text-muted-foreground hover:border-amber-200  hover:text-amber-700",
            cancelled: filter === f ? "bg-red-100    text-red-600     border-red-300"             : "border-border text-muted-foreground hover:border-red-200    hover:text-red-600",
          };
          return (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold capitalize transition ${tabStyle[f]}`}>
              {f === "all" ? "All" : f} <span className="ml-1 opacity-70">({counts[f]})</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          No appointments match your filter.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => {
            const past = isPast(a.time);
            return (
              <div key={a.id} className={`rounded-2xl border bg-card p-4 sm:p-5 transition ${a.status === "cancelled" ? "border-border opacity-70" : "border-border"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: time badge + details */}
                  <div className="flex items-start gap-3">
                    <div className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-xl border py-2 text-center ${a.status === "confirmed" ? "border-emerald-200 bg-emerald-50" : a.status === "pending" ? "border-amber-200 bg-amber-50" : "border-border bg-secondary"}`}>
                      <span className="font-mono text-base font-extrabold leading-none">{a.time}</span>
                      <span className={`mt-1 text-[9px] font-semibold uppercase tracking-wider ${past ? "text-muted-foreground" : "text-primary"}`}>{past ? "past" : "upcoming"}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold">{a.patient}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusStyle[a.status]}`}>{a.status}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.doctor} · {a.type}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">{a.room} · {a.id} · {a.date}</p>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex gap-2 sm:shrink-0">
                    {a.status === "pending" && (
                      <button onClick={() => confirm(a.id)} className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200">
                        <CheckCircle2 className="size-3.5" /> Confirm
                      </button>
                    )}
                    {a.status !== "cancelled" && (
                      <button onClick={() => cancel(a.id)} className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="size-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-secondary px-5 py-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">{counts.confirmed} confirmed</div>
        <div className="rounded-lg border border-amber-200  bg-amber-100  px-3 py-1.5 text-xs font-semibold text-amber-700" >{counts.pending}   pending</div>
        <div className="rounded-lg border border-red-200    bg-red-100    px-3 py-1.5 text-xs font-semibold text-red-600"  >{counts.cancelled} cancelled</div>
        <div className="ml-auto text-xs text-muted-foreground self-center">Total: {counts.all} appointments</div>
      </div>
    </div>
  );
}

function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ hospitalName: "Hospital Kigali", address: "KG 7 Ave, Kigali, Rwanda", phone: "+250 788 000 000", email: "info@hospitalkigali.rw", maxSlots: "8", queueAlert: "15", maintenanceMode: false });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-xl font-bold">System Settings</h3>
        <p className="text-sm text-muted-foreground">Configure hospital-wide preferences</p>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Hospital information</h4>
        <AdminFormField label="Hospital name" value={form.hospitalName} onChange={set("hospitalName")} />
        <AdminFormField label="Address" value={form.address} onChange={set("address")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminFormField label="Phone" value={form.phone} onChange={set("phone")} icon={<Phone className="size-4 text-muted-foreground" />} />
          <AdminFormField label="Email" value={form.email} onChange={set("email")} type="email" icon={<Mail className="size-4 text-muted-foreground" />} />
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Booking configuration</h4>
        <AdminFormField label="Max slots per doctor per day" value={form.maxSlots} onChange={set("maxSlots")} type="number" />
        <AdminFormField label="Queue alert threshold (minutes)" value={form.queueAlert} onChange={set("queueAlert")} type="number" />
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3">
          <div>
            <p className="text-sm font-medium">Maintenance mode</p>
            <p className="text-xs text-muted-foreground">Blocks new bookings while enabled</p>
          </div>
          <button onClick={() => setForm(f => ({ ...f, maintenanceMode: !f.maintenanceMode }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.maintenanceMode ? "bg-primary" : "bg-border"}`}>
            <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${form.maintenanceMode ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:brightness-95">
          Save changes
        </button>
        {saved && (
          <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="size-4" /> Saved
          </motion.span>
        )}
      </div>
    </div>
  );
}

function AdminFormField({ label, value, onChange, type = "text", icon }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; icon?: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 transition focus-within:border-primary">
        {icon}
        <input type={type} value={value} onChange={onChange} className="flex-1 bg-transparent text-sm outline-none" />
      </div>
    </div>
  );
}

/* ── Doctor Portal ─────────────────────────────────────── */

type DoctorTab = "overview" | "appointments" | "patients" | "profile";

const DR_APPOINTMENTS = [
  { id: "DA-001", patient: "Francis Charles Mbayo", age: 20, date: "28 Jun 2026", time: "09:00", type: "General consultation", status: "upcoming", notes: "Routine check-up" },
];

const DR_PATIENTS = [
  { id: "P-001", name: "Francis Charles Mbayo", age: 20, email: "mbayocharles26@gmail.com", lastVisit: "28 Jun 2026", visits: 1, status: "active" },
];

function DoctorPortal({ doctor, onLogout, isDark, toggleDark }: { doctor: RegisteredDoctor; onLogout: () => void; isDark: boolean; toggleDark: () => void }) {
  const [tab, setTab] = useState<DoctorTab>("overview");
  const [clock] = useState(() => new Date());

  const navItems: { id: DoctorTab; label: string; icon: ElementType }[] = [
    { id: "overview",     label: "Overview",     icon: LayoutDashboard },
    { id: "appointments", label: "Appointments", icon: CalendarCheck },
    { id: "patients",     label: "Patients",     icon: Users },
    { id: "profile",      label: "My Profile",   icon: UserRound },
  ];

  return (
    <div className="flex min-h-svh">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card p-5 shadow-xl lg:flex lg:sticky lg:top-0 lg:h-svh">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <HeartPulse className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold">MediBridge</p>
            <p className="text-xs text-muted-foreground">Doctor Portal</p>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Icon className="size-4" />{item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-5">
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
              {doctor.name.split(" ").slice(-1)[0][0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{doctor.name}</p>
              <p className="truncate text-xs text-muted-foreground">{doctor.specialty}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-destructive">
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-base font-bold capitalize sm:text-lg">
              {{ overview: "Dashboard", appointments: "My Appointments", patients: "My Patients", profile: "My Profile" }[tab]}
            </h2>
            <p className="hidden text-xs text-muted-foreground sm:block">Hospital Kigali</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Online
            </span>
            <button onClick={toggleDark} className="flex size-9 items-center justify-center rounded-2xl border border-border text-muted-foreground transition hover:bg-secondary">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={isDark ? "sun" : "moon"} initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 30 }} transition={{ duration: 0.18 }} className="absolute">
                  {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button onClick={onLogout} className="flex items-center gap-1.5 rounded-2xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-destructive lg:hidden">
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            {tab === "overview"     && <DoctorOverview doctor={doctor} clock={clock} setTab={setTab} />}
            {tab === "appointments" && <DoctorAppointments doctor={doctor} />}
            {tab === "patients"     && <DoctorPatients />}
            {tab === "profile"      && <DoctorProfile doctor={doctor} />}
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
          <div className="flex">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)} className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <Icon className={`size-5 ${active ? "scale-110" : ""} transition-transform`} />
                  <span>{item.label}</span>
                  {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function DoctorOverview({ doctor, clock, setTab }: { doctor: RegisteredDoctor; clock: Date; setTab: (t: DoctorTab) => void }) {
  const dateStr = clock.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Welcome */}
      <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground sm:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-primary-foreground/60">Doctor Portal</p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Welcome, {doctor.name}</h2>
        <p className="mt-1 text-sm text-primary-foreground/70">{dateStr}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-white/60">Specialty</p>
            <p className="mt-0.5 text-sm font-bold">{doctor.specialty}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-white/60">License</p>
            <p className="mt-0.5 font-mono text-sm font-bold">{doctor.licenseNo}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-white/60">Status</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-300">● Active</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Appointments today", value: String(DR_APPOINTMENTS.filter(a => a.date === "28 Jun 2026" && a.status !== "cancelled").length), icon: CalendarCheck, color: "bg-sky-100 text-sky-600" },
          { label: "Upcoming",           value: String(DR_APPOINTMENTS.filter(a => a.status === "upcoming").length),                               icon: Clock3,        color: "bg-amber-100 text-amber-600" },
          { label: "Total patients",     value: String(DR_PATIENTS.length),                                                                        icon: Users,         color: "bg-emerald-100 text-emerald-600" },
          { label: "Experience",         value: `${doctor.experience} yrs`,                                                                        icon: BadgeCheck,    color: "bg-violet-100 text-violet-600" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[1.5rem] border border-border bg-card p-4 sm:p-5">
              <div className={`inline-flex size-9 items-center justify-center rounded-xl ${s.color}`}>
                <Icon className="size-4" />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="rounded-[2rem] border border-border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-bold">Quick actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button onClick={() => setTab("appointments")} className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-left transition hover:bg-accent">
            <CalendarCheck className="size-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Appointments</p>
              <p className="text-xs text-muted-foreground">{DR_APPOINTMENTS.filter(a => a.status === "upcoming").length} upcoming</p>
            </div>
          </button>
          <button onClick={() => setTab("patients")} className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-left transition hover:bg-accent">
            <Users className="size-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Patients</p>
              <p className="text-xs text-muted-foreground">{DR_PATIENTS.filter(p => p.status === "active").length} active</p>
            </div>
          </button>
          <button onClick={() => setTab("profile")} className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-left transition hover:bg-accent">
            <UserRound className="size-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">My profile</p>
              <p className="text-xs text-muted-foreground">View credentials</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function DoctorAppointments({ doctor }: { doctor: RegisteredDoctor }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [query, setQuery]   = useState("");

  const visible = DR_APPOINTMENTS.filter(a => {
    const matchF = filter === "all" || a.status === filter;
    const q = query.toLowerCase();
    const matchQ = !q || a.patient.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    return matchF && matchQ;
  });

  const counts = {
    all:       DR_APPOINTMENTS.length,
    upcoming:  DR_APPOINTMENTS.filter(a => a.status === "upcoming").length,
    completed: DR_APPOINTMENTS.filter(a => a.status === "completed").length,
    cancelled: DR_APPOINTMENTS.filter(a => a.status === "cancelled").length,
  };

  const statusStyle: Record<string, string> = {
    upcoming:  "border-emerald-200 bg-emerald-100 text-emerald-700",
    completed: "border-border bg-secondary text-muted-foreground",
    cancelled: "border-red-200 bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold">My Appointments</h3>
          <p className="mt-1 text-sm text-muted-foreground">{doctor.specialty} · {doctor.hospital}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary transition sm:w-56">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Patient, type, ID…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          {query && <button onClick={() => setQuery("")}><X className="size-4 text-muted-foreground" /></button>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "upcoming", "completed", "cancelled"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold capitalize transition ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">No appointments match your filter.</div>
      ) : (
        <div className="space-y-3">
          {visible.map(a => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 text-center ${a.status === "upcoming" ? "border-emerald-200 bg-emerald-50" : a.status === "cancelled" ? "border-red-200 bg-red-50" : "border-border bg-secondary"}`}>
                    <span className="font-mono text-base font-extrabold leading-none">{a.time}</span>
                    <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{a.date.slice(0, 6)}</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{a.patient}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusStyle[a.status]}`}>{a.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.type} · {a.id}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70 italic">{a.notes}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DoctorPatients() {
  const [query, setQuery] = useState("");

  const filtered = DR_PATIENTS.filter(p => {
    const q = query.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold">My Patients</h3>
          <p className="mt-1 text-sm text-muted-foreground">{DR_PATIENTS.length} registered · {DR_PATIENTS.filter(p => p.status === "active").length} active</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary transition sm:w-56">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, email, ID…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          {query && <button onClick={() => setQuery("")}><X className="size-4 text-muted-foreground" /></button>}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total",    value: DR_PATIENTS.length,                                     cls: "border-border bg-card" },
          { label: "Active",   value: DR_PATIENTS.filter(p => p.status === "active").length,  cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
          { label: "Inactive", value: DR_PATIENTS.filter(p => p.status === "inactive").length,cls: "border-border bg-secondary text-muted-foreground" },
          { label: "Avg visits",value: Math.round(DR_PATIENTS.reduce((s, p) => s + p.visits, 0) / DR_PATIENTS.length), cls: "border-sky-200 bg-sky-50 text-sky-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border px-4 py-3 ${s.cls}`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="mt-0.5 text-xs font-medium opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Patient rows */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="hidden grid-cols-[1fr_60px_120px_70px_90px] gap-4 bg-secondary px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Patient</span><span>Age</span><span>Last visit</span><span>Visits</span><span>Status</span>
        </div>
        <div className="divide-y divide-border bg-card">
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No patients match your search.</p>
          )}
          {filtered.map(p => (
            <div key={p.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_60px_120px_70px_90px] sm:items-center sm:gap-4 sm:px-5 sm:py-3">
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.id} · {p.email}</p>
              </div>
              <span className="text-sm text-muted-foreground">{p.age}</span>
              <span className="text-sm text-muted-foreground">{p.lastVisit}</span>
              <span className="text-sm text-muted-foreground">{p.visits}</span>
              <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${p.status === "active" ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-border bg-secondary text-muted-foreground"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DoctorProfile({ doctor }: { doctor: RegisteredDoctor }) {
  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <h3 className="text-xl font-bold">My Profile</h3>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* ID card */}
        <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground">
          <div className="grid size-14 place-items-center rounded-2xl bg-white/15">
            <Stethoscope className="size-7" />
          </div>
          <h4 className="mt-4 text-xl font-bold">{doctor.name}</h4>
          <p className="mt-1 text-sm text-primary-foreground/70">{doctor.specialty}</p>
          <div className="mt-4 space-y-1.5 text-sm text-primary-foreground/75">
            <p>📋 {doctor.licenseNo}</p>
            <p>🏥 {doctor.hospital}</p>
            <p>📋 {doctor.experience} years experience</p>
            <p>📅 Joined {doctor.joinedDate}</p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
            ● Approved
          </span>
        </div>

        {/* Details */}
        <div className="rounded-[2rem] border border-border bg-card p-5 sm:p-6 space-y-4">
          <h4 className="text-lg font-bold">Contact & credentials</h4>
          {[
            { label: "Full name",   value: doctor.name },
            { label: "Email",       value: doctor.email },
            { label: "Phone",       value: doctor.phone },
            { label: "Specialty",   value: doctor.specialty },
            { label: "License no.", value: doctor.licenseNo },
            { label: "Hospital",    value: doctor.hospital },
            { label: "Experience",  value: `${doctor.experience} years` },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
              <span className="text-sm text-muted-foreground">{f.label}</span>
              <span className="text-sm font-semibold">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Patient screens ───────────────────────────────────── */

function Login({ onEnter, onDoctorEnter, onRegister, onAdmin, registeredDoctors }: {
  onEnter: () => void;
  onDoctorEnter: (doc: RegisteredDoctor) => void;
  onRegister: () => void;
  onAdmin: () => void;
  registeredDoctors: RegisteredDoctor[];
}) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password)     { setError("Please enter your password."); return; }

    // Check registered doctors first
    const matchedDoc = registeredDoctors.find(
      d => d.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (matchedDoc) {
      if (matchedDoc.status === "pending") {
        setError("Your doctor account is awaiting admin approval. You will be notified once approved.");
        return;
      }
      if (matchedDoc.status === "rejected") {
        setError("Your registration was not approved by the admin. Please contact Hospital Kigali for assistance.");
        return;
      }
      // approved doctor — validate password then route to doctor portal
      const DOCTOR_PASSWORDS: Record<string, string> = {
        "doctor@#26@gmail.com": "Doctor2026",
      };
      const expectedPw = DOCTOR_PASSWORDS[matchedDoc.email.toLowerCase()];
      if (expectedPw && password !== expectedPw) {
        setError("Incorrect password. Please try again.");
        return;
      }
      setError("");
      onDoctorEnter(matchedDoc);
      return;
    }

    setError("");
    onEnter();
  };

  return (
    <div className="grid lg:grid-cols-[1fr_0.85fr]">
      <div className="rounded-t-[2rem] bg-primary p-6 text-primary-foreground sm:p-8 lg:rounded-l-[2rem] lg:rounded-tr-none lg:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-200">Secure patient access</p>
        <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.02]">Care starts before the queue.</h2>
        <p className="mt-4 max-w-lg text-sm text-white/75 sm:mt-6 sm:text-base lg:text-lg">
          Book available doctors, review records, and receive confirmation without waiting at reception.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:mt-12 sm:gap-3">
          <Metric value="24/7" label="booking" />
          <Metric value="6" label="screens" />
        </div>
      </div>
      <div className="rounded-b-[2rem] bg-white p-6 sm:p-8 lg:rounded-r-[2rem] lg:rounded-bl-none">
        <h3 className="text-2xl font-bold sm:text-3xl">Login</h3>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Enter your credentials to access your account.</p>
        <div className="mt-6 space-y-4 sm:mt-8">
          {/* Email */}
          <div>
            <label className="block text-sm text-muted-foreground">Email address</label>
            <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-secondary px-4 py-3.5 transition focus-within:border-primary sm:py-4 ${error && !email.trim() ? "border-destructive" : "border-border"}`}>
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 sm:text-base"
              />
            </div>
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm text-muted-foreground">Password</label>
            <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-secondary px-4 py-3.5 transition focus-within:border-primary sm:py-4 ${error && !password ? "border-destructive" : "border-border"}`}>
              <LockKeyhole className="size-4 shrink-0 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 sm:text-base"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-muted-foreground transition hover:text-foreground">
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <button onClick={handleLogin} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-bold text-accent-foreground transition hover:brightness-95 sm:mt-8">
          Login to dashboard <ChevronRight className="size-5" />
        </button>
        <button onClick={onRegister} className="mt-3 w-full rounded-2xl border border-border px-5 py-4 font-bold transition hover:bg-secondary">
          Register new patient
        </button>
        <div className="mt-4 flex justify-center">
          <button onClick={onAdmin} className="flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground">
            <ShieldCheck className="size-3.5" /> Admin portal
          </button>
        </div>
      </div>
    </div>
  );
}

type Role = "patient" | "doctor";

function Register({ onSuccess, onBack, onDoctorRegister }: {
  onSuccess: () => void;
  onBack: () => void;
  onDoctorRegister?: (doc: RegisteredDoctor) => void;
}) {
  const [role, setRole] = useState<Role>("patient");
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shared, setShared] = useState({ firstName: "", lastName: "", email: "", dob: "", gender: "", phone: "", password: "", confirm: "" });
  const [doctor, setDoc] = useState({ licenseNo: "", specialty: "", hospital: "", experience: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  type SharedKey = keyof typeof shared;
  type DocKey = keyof typeof doctor;

  const setS = (k: SharedKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setShared(f => ({ ...f, [k]: e.target.value }));
  const setD = (k: DocKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDoc(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!shared.firstName.trim()) e.firstName = "Required";
    if (!shared.lastName.trim()) e.lastName = "Required";
    if (!shared.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shared.email)) e.email = "Valid email required";
    if (!shared.dob) e.dob = "Required";
    if (!shared.gender) e.gender = "Required";
    if (!shared.phone.trim()) e.phone = "Required";
    if (shared.password.length < 8) e.password = "Min 8 characters";
    if (shared.confirm !== shared.password) e.confirm = "Passwords don't match";
    if (role === "doctor") {
      if (!doctor.licenseNo.trim()) e.licenseNo = "Required";
      if (!doctor.specialty) e.specialty = "Required";
      if (!doctor.hospital.trim()) e.hospital = "Required";
      if (!doctor.experience.trim()) e.experience = "Required";
    }
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      if (role === "doctor" && onDoctorRegister) {
        onDoctorRegister({
          id: `REG-${Date.now()}`,
          name: `Dr. ${shared.firstName} ${shared.lastName}`,
          specialty: doctor.specialty,
          email: shared.email,
          phone: shared.phone,
          licenseNo: doctor.licenseNo,
          hospital: doctor.hospital,
          experience: doctor.experience,
          joinedDate: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
          status: "pending",
        });
        // Don't setSubmitted — onDoctorRegister navigates to login
        return;
      }
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-10 text-center">
        <div className={`grid size-20 place-items-center rounded-full ${role === "doctor" ? "bg-sky-100" : "bg-emerald-100"}`}>
          {role === "doctor" ? <Stethoscope className="size-10 text-sky-600" /> : <CheckCircle2 className="size-10 text-emerald-600" />}
        </div>
        <div>
          <p className={`font-mono text-xs uppercase tracking-widest ${role === "doctor" ? "text-sky-700" : "text-emerald-700"}`}>
            {role === "doctor" ? "Doctor account created" : "Registration successful"}
          </p>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Welcome, {role === "doctor" ? "Dr." : ""} {shared.firstName}!</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {role === "doctor" ? "Your doctor profile is pending verification. You'll be notified once approved." : "Your patient account has been created. You can now access your dashboard."}
          </p>
        </div>
        <button onClick={onSuccess} className="rounded-2xl bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:brightness-95">
          Go to dashboard <ChevronRight className="inline size-5" />
        </button>
      </div>
    );
  }

  const rolePerks: Record<Role, { icon: ElementType; text: string }[]> = {
    patient: [{ icon: ShieldCheck, text: "Your data is encrypted and secure" }, { icon: HeartPulse, text: "Instant access to appointment booking" }, { icon: FileText, text: "Digital medical records on demand" }],
    doctor: [{ icon: BadgeCheck, text: "Verified professional profile" }, { icon: CalendarCheck, text: "Manage your schedule and slots" }, { icon: Building2, text: "Connected to Hospital Kigali network" }],
  };

  return (
    <div className="grid lg:grid-cols-[0.9fr_1fr]">
      <div className={`rounded-t-[2rem] p-6 text-primary-foreground sm:p-8 lg:rounded-l-[2rem] lg:rounded-tr-none lg:p-10 ${role === "doctor" ? "bg-sky-700" : "bg-primary"}`}>
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-white/70 transition hover:text-white"><ArrowLeft className="size-4" /> Back to login</button>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-200">{role === "doctor" ? "Medical professional" : "New patient"}</p>
        <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">{role === "doctor" ? "Create your doctor profile." : "Create your patient account."}</h2>
        <p className="mt-4 text-sm text-white/75 sm:text-base">Join Hospital Kigali's digital health platform.</p>
        <div className="mt-8 space-y-3">
          {rolePerks[role].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3"><Icon className="size-5 shrink-0 text-emerald-300" /><span className="text-sm">{text}</span></div>
          ))}
        </div>
      </div>
      <div className="rounded-b-[2rem] bg-white p-6 sm:p-8 lg:rounded-r-[2rem] lg:rounded-bl-none overflow-y-auto max-h-[85vh] lg:max-h-none">
        <div className="flex gap-2 rounded-2xl bg-secondary p-1">
          {(["patient", "doctor"] as Role[]).map((r) => (
            <button key={r} onClick={() => { setRole(r); setErrors({}); }} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${role === r ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {r === "patient" ? <UserRound className="size-4" /> : <Stethoscope className="size-4" />}
              {r === "patient" ? "Patient" : "Doctor"}
            </button>
          ))}
        </div>
        <h3 className="mt-5 text-xl font-bold sm:text-2xl">Personal information</h3>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name" value={shared.firstName} onChange={setS("firstName")} placeholder="Francis" error={errors.firstName} />
            <FormField label="Last name" value={shared.lastName} onChange={setS("lastName")} placeholder="Mbayo" error={errors.lastName} />
          </div>
          <FormField label="Email address" type="email" value={shared.email} onChange={setS("email")} placeholder="mbayocharles26@gmail.com" error={errors.email} icon={<Mail className="size-4 text-muted-foreground" />} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date of birth" type="date" value={shared.dob} onChange={setS("dob")} error={errors.dob} />
            <SelectField label="Gender" value={shared.gender} onChange={setS("gender")} error={errors.gender} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }, { value: "prefer_not", label: "Prefer not to say" }]} />
          </div>
          <FormField label="Phone number" type="tel" value={shared.phone} onChange={setS("phone")} placeholder="+250 700 000 000" error={errors.phone} icon={<Phone className="size-4 text-muted-foreground" />} />
          {role === "doctor" && (
            <>
              <hr className="border-border" />
              <p className="text-sm font-semibold text-muted-foreground">Professional details</p>
              <FormField label="Medical license number" value={doctor.licenseNo} onChange={setD("licenseNo")} placeholder="KGL-MED-2024-XXXX" error={errors.licenseNo} icon={<BadgeCheck className="size-4 text-muted-foreground" />} />
              <SelectField label="Specialty" value={doctor.specialty} onChange={setD("specialty")} error={errors.specialty} options={SPECIALTIES.map(s => ({ value: s, label: s }))} />
              <FormField label="Hospital / Clinic" value={doctor.hospital} onChange={setD("hospital")} placeholder="Hospital Kigali" error={errors.hospital} icon={<Building2 className="size-4 text-muted-foreground" />} />
              <FormField label="Years of experience" type="number" value={doctor.experience} onChange={setD("experience")} placeholder="e.g. 5" error={errors.experience} />
            </>
          )}
          <hr className="border-border" />
          <p className="text-sm font-semibold text-muted-foreground">Set a password</p>
          <div>
            <label className="block text-sm text-muted-foreground">Password</label>
            <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-secondary px-4 py-3 sm:py-3.5 ${errors.password ? "border-destructive" : "border-border"} focus-within:border-primary transition`}>
              <LockKeyhole className="size-4 shrink-0 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={shared.password} onChange={setS("password")} placeholder="Min 8 characters" className="flex-1 bg-transparent text-sm outline-none sm:text-base" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-muted-foreground transition hover:text-foreground">
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
          </div>
          <FormField label="Confirm password" type={showPw ? "text" : "password"} value={shared.confirm} onChange={setS("confirm")} placeholder="Repeat password" error={errors.confirm} icon={<LockKeyhole className="size-4 text-muted-foreground" />} />
        </div>
        <button onClick={submit} className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-bold text-white transition hover:brightness-95 ${role === "doctor" ? "bg-sky-700" : "bg-accent text-accent-foreground"}`}>
          {role === "doctor" ? "Submit for verification" : "Create account"} <ChevronRight className="size-5" />
        </button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <button onClick={onBack} className="font-semibold text-primary underline underline-offset-2">Login here</button>
        </p>
      </div>
    </div>
  );
}

function AnimatedCount({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    setVal(0);
    let cur = 0;
    const step = Math.max(1, Math.ceil(to / 30));
    ref.current = setInterval(() => {
      cur = Math.min(cur + step, to);
      setVal(cur);
      if (cur >= to && ref.current) clearInterval(ref.current);
    }, 30);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [to]);
  return <>{val}</>;
}

function Dashboard({ go }: { go: (s: Screen) => void }) {
  // Compute live stats from actual data
  const approvedDoctors  = DOCTORS_DATA.filter(d => d.status === "approved");
  const availableNow     = approvedDoctors.filter(d => d.available);
  const confirmedToday   = APPOINTMENTS_DATA.filter(a => a.status === "confirmed").length;
  const totalTodayAppts  = approvedDoctors.reduce((sum, d) => sum + d.todayAppts, 0);
  const avgQueueMins     = availableNow.length > 0
    ? Math.round((totalTodayAppts / approvedDoctors.length) * 3.5)
    : 0;

  const stats = [
    {
      icon: CalendarCheck,
      label: "appointments confirmed today",
      value: confirmedToday,
      sub: `${APPOINTMENTS_DATA.filter(a => a.status === "pending").length} pending confirmation`,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      icon: Stethoscope,
      label: "doctors currently available",
      value: availableNow.length,
      sub: `${approvedDoctors.length} on duty today · ${DOCTORS_DATA.filter(d => d.status === "pending").length} pending approval`,
      color: "text-sky-600",
      bg: "bg-sky-100",
    },
    {
      icon: Clock3,
      label: "average queue time",
      value: `${avgQueueMins} min`,
      sub: `${totalTodayAppts} total appointments across ${approvedDoctors.length} doctors`,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      icon: Users,
      label: "registered patients",
      value: PATIENTS_DATA.length,
      sub: `${PATIENTS_DATA.filter(p => p.status === "active").length} active`,
      color: "text-violet-600",
      bg: "bg-violet-100",
    },
  ];

  return (
    <div>
      <ScreenTitle kicker="Dashboard" title={`Good morning, ${PATIENT.firstName}.`} copy="Overview of appointments, services, staff availability, and patient records." />

      {/* Stat cards — animated counters + stagger */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const numVal = typeof s.value === "number" ? s.value : null;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="rounded-[1.5rem] border border-border bg-card p-4 sm:p-5"
            >
              <div className={`inline-flex size-9 items-center justify-center rounded-xl sm:size-10 ${s.bg}`}>
                <Icon className={`size-4 sm:size-5 ${s.color}`} />
              </div>
              <p className="mt-3 text-2xl font-extrabold sm:text-3xl">
                {numVal !== null ? <AnimatedCount to={numVal} /> : s.value}
              </p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground capitalize">{s.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/60">{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Services + next step */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Service icon={CalendarCheck} title="Book appointment" copy="Find doctors with open slots." onClick={() => go("doctors")} />
        <Service icon={FileText} title="Medical records" copy="View lab results and visit notes." onClick={() => go("profile")} />
        <Service icon={UsersRound} title="Staff support" copy="Coordinate with reception." onClick={() => go("doctors")} />
      </div>

      {/* Today panel + next step */}
      <div className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[2rem] border border-border p-5 sm:p-6">
          <h3 className="text-xl font-bold sm:text-2xl">Today at Hospital Kigali</h3>
          <p className="mt-1 text-xs text-muted-foreground">Sunday, 28 June 2026</p>
          <div className="mt-4 space-y-3 sm:mt-5">
            {[
              { icon: CalendarCheck, text: `${confirmedToday} appointment${confirmedToday !== 1 ? "s" : ""} confirmed`, color: "text-emerald-600" },
              { icon: Stethoscope,   text: `${availableNow.length} of ${approvedDoctors.length} doctors currently available`, color: "text-sky-600" },
              { icon: Clock3,        text: `Average queue time: ${avgQueueMins} minutes`, color: "text-amber-600" },
              { icon: Users,         text: `${PATIENTS_DATA.length} registered patient${PATIENTS_DATA.length !== 1 ? "s" : ""} on record`, color: "text-violet-600" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl bg-secondary p-3 sm:gap-4 sm:p-4">
                <Icon className={`size-5 shrink-0 ${color}`} />
                <span className="text-sm sm:text-base">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-emerald-50 p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-emerald-700">Next step</p>
          <h3 className="mt-3 text-xl font-bold sm:mt-4 sm:text-2xl">Choose a doctor and time slot.</h3>
          <p className="mt-2 text-sm text-emerald-700/70">{availableNow.length} doctor{availableNow.length !== 1 ? "s" : ""} available right now.</p>
          <button onClick={() => go("doctors")} className="mt-4 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-95 sm:mt-5 sm:text-base">
            Start booking
          </button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_SLOTS = ["09:00", "10:30", "11:45", "13:00", "14:30", "15:15", "16:00", "17:30"];
const DOCTOR_SLOTS: Record<number, string[]> = {};

const SPECIALTIES_FILTER = ["All", "Cardiology", "General Medicine", "Pediatrics"];

function DoctorList({ doctors, setSelectedDoctor, go }: { doctors: typeof DOCTORS_DATA; setSelectedDoctor: (d: typeof DOCTORS_DATA[number]) => void; go: (s: Screen) => void }) {
  const [query,      setQuery]      = useState("");
  const [specialty,  setSpecialty]  = useState("All");
  const [sortBy,     setSortBy]     = useState<"availability" | "rating" | "patients">("availability");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hiddenIds,  setHiddenIds]  = useState<number[]>([]);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [notes,      setNotes]      = useState<Record<number, string>>({});
  const [noteDraft,  setNoteDraft]  = useState("");
  const [toast,      setToast]      = useState<{ msg: string; undoId?: number } | null>(null);

  const hideDoctor = (id: number) => {
    setHiddenIds(h => [...h, id]);
    setExpandedId(null);
    setToast({ msg: "Doctor removed from your list.", undoId: id });
    setTimeout(() => setToast(null), 4000);
  };

  const undoHide = (id: number) => {
    setHiddenIds(h => h.filter(x => x !== id));
    setToast(null);
  };

  const openEdit = (id: number) => {
    setNoteDraft(notes[id] ?? "");
    setEditingId(id);
  };

  const saveNote = (id: number) => {
    setNotes(n => ({ ...n, [id]: noteDraft.trim() }));
    setEditingId(null);
  };

  const approved = doctors; // already filtered by App to only show approved/visible doctors

  const filtered = approved
    .filter(d => {
      if (hiddenIds.includes(d.id)) return false;
      const q = query.toLowerCase();
      const matchQ = !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.room.toLowerCase().includes(q);
      const matchS = specialty === "All" || d.specialty === specialty;
      return matchQ && matchS;
    })
    .sort((a, b) => {
      if (sortBy === "rating")   return parseFloat(b.rating) - parseFloat(a.rating);
      if (sortBy === "patients") return b.patients - a.patients;
      return a.next.startsWith("Today") ? -1 : 1;
    });

  const book = (doc: typeof DOCTORS_DATA[number]) => { setSelectedDoctor(doc); go("booking"); };

  return (
    <div>
      <ScreenTitle kicker="Doctor List" title="Available doctors" copy="Search, filter, and preview — then book your slot." />

      {/* Search + sort row */}
      <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 focus-within:border-primary transition">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, specialty, or room…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:text-base"
          />
          {query && <button onClick={() => setQuery("")}><X className="size-4 text-muted-foreground" /></button>}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary transition"
        >
          <option value="availability">Sort: Availability</option>
          <option value="rating">Sort: Rating</option>
          <option value="patients">Sort: Most patients</option>
        </select>
      </div>

      {/* Specialty chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {["All", ...Array.from(new Set(approved.map(d => d.specialty)))].map(s => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition ${specialty === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {approved.length - hiddenIds.length} visible</span>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
        >
          <span className="text-sm text-muted-foreground">{toast.msg}</span>
          {toast.undoId != null && (
            <button onClick={() => undoHide(toast.undoId!)} className="ml-4 text-sm font-bold text-primary underline underline-offset-2">
              Undo
            </button>
          )}
        </motion.div>
      )}

      {/* Doctor cards */}
      <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-border bg-white px-5 py-10 text-center text-sm text-muted-foreground">
            {hiddenIds.length > 0 && approved.length - hiddenIds.length === 0
              ? "You've removed all doctors. Use Undo to restore them."
              : "No doctors match your search."}
          </div>
        )}

        {filtered.map((doctor, idx) => {
          const expanded  = expandedId === doctor.id;
          const isEditing = editingId  === doctor.id;
          const todayAvail = doctor.next.startsWith("Today");
          const myNote = notes[doctor.id];

          return (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.06 }}
              className={`rounded-[1.5rem] border bg-card transition ${expanded ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/30 hover:shadow-md"}`}
            >

              {/* Main row */}
              <div className="flex w-full flex-col gap-3 p-4 text-left sm:gap-0 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: avatar + info — clickable to expand */}
                  <button
                    onClick={() => { setExpandedId(expanded ? null : doctor.id); setEditingId(null); }}
                    className="flex flex-1 gap-3 text-left sm:gap-4"
                  >
                    <div className="relative shrink-0">
                      <div className={`grid size-12 place-items-center rounded-2xl sm:size-14 ${doctor.color}`}>
                        <Stethoscope className="size-5 sm:size-6" />
                      </div>
                      <span className={`absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white ${doctor.available ? "bg-emerald-500" : "bg-amber-400"}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold sm:text-lg">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialty} · ★ {doctor.rating}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{doctor.room}</span>
                        <span>{doctor.patients} patients</span>
                        <span>{doctor.experience} yrs exp.</span>
                      </div>
                      {myNote && (
                        <p className="mt-1.5 inline-block rounded-lg bg-sky-50 px-2.5 py-1 text-xs text-sky-700 border border-sky-200">
                          📝 {myNote}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Right: actions + availability */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {/* Edit / Delete buttons */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { openEdit(doctor.id); setExpandedId(null); }}
                        title="Edit note"
                        className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
                      >
                        <FileText className="size-3.5" />
                      </button>
                      <button
                        onClick={() => hideDoctor(doctor.id)}
                        title="Remove from list"
                        className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    {/* Availability badge */}
                    <div className={`rounded-xl border px-3 py-1.5 text-left ${todayAvail ? "border-emerald-200 bg-emerald-50" : "border-border bg-secondary"}`}>
                      <p className="text-[10px] text-muted-foreground">Next available</p>
                      <p className={`text-xs font-bold ${todayAvail ? "text-emerald-700" : ""}`}>{doctor.next}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit note panel */}
              {isEditing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-border">
                  <div className="p-4 sm:p-5">
                    <p className="mb-2 text-sm font-semibold">Add a personal note about {doctor.name}</p>
                    <textarea
                      autoFocus
                      value={noteDraft}
                      onChange={e => setNoteDraft(e.target.value)}
                      placeholder="e.g. Prefers morning slots, very thorough…"
                      rows={2}
                      className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-primary transition resize-none"
                    />
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => saveNote(doctor.id)} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:brightness-95">
                        Save note
                      </button>
                      <button onClick={() => { setNotes(n => { const c = { ...n }; delete c[doctor.id]; return c; }); setEditingId(null); }} className="rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground transition hover:bg-secondary">
                        Clear
                      </button>
                      <button onClick={() => setEditingId(null)} className="ml-auto rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground transition hover:bg-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Expanded: slot picker + quick book */}
              {expanded && !isEditing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.22 }} className="overflow-hidden border-t border-border">
                  <div className="p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <p className="text-sm font-semibold">Available slots — Sunday, 28 June 2026</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${doctor.available ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                        {doctor.available ? "● Available now" : "● In session"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {(DOCTOR_SLOTS[doctor.id] ?? DEFAULT_SLOTS).map(slot => (
                        <button key={slot} onClick={() => book(doctor)} className="rounded-xl border border-border bg-secondary py-3 text-sm font-bold transition hover:border-primary hover:bg-primary hover:text-primary-foreground">
                          {slot}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">📍 {doctor.room} · ✉ {doctor.email} · 📞 {doctor.phone}</p>
                      <button onClick={() => book(doctor)} className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-95">
                        Book appointment <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const BOOKING_HISTORY: {
  id: string; doctor: string; specialty: string; room: string;
  date: string; time: string; status: string; color: string;
}[] = [];

const SLOTS = ["09:00", "10:30", "11:45", "13:00", "14:30", "15:15", "16:00", "17:30"];

// Days unavailable: weekends + past dates relative to 28 Jun 2026
function isDayAvailable(year: number, month: number, day: number) {
  const d = new Date(year, month, day);
  const today = new Date(2026, 5, 28); // 28 Jun 2026 baseline
  if (d < today) return false;
  const dow = d.getDay();
  return dow !== 0 && dow !== 6; // no Sundays/Saturdays except today
}

function MiniCalendar({ selectedDate, onSelect }: { selectedDate: Date; onSelect: (d: Date) => void }) {
  const [viewYear,  setViewYear]  = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const DAYS   = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;     // shift so Mon=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="flex size-8 items-center justify-center rounded-xl border border-border transition hover:bg-secondary">
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-bold">{MONTHS[viewMonth]} {viewYear}</p>
        <button onClick={nextMonth} className="flex size-8 items-center justify-center rounded-xl border border-border transition hover:bg-secondary">
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const available = isDayAvailable(viewYear, viewMonth, day);
          const isSelected = selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
          const isToday = viewYear === 2026 && viewMonth === 5 && day === 28;

          return (
            <button
              key={day}
              disabled={!available}
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              className={[
                "flex size-8 items-center justify-center rounded-xl text-xs font-semibold transition mx-auto",
                isSelected  ? "bg-primary text-primary-foreground shadow" :
                isToday     ? "border border-primary text-primary hover:bg-primary/10" :
                available   ? "hover:bg-secondary text-foreground" :
                              "text-muted-foreground/40 cursor-not-allowed",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Booking({ doctor, selectedSlot, setSelectedSlot, go }: { doctor: typeof DOCTORS_DATA[number]; selectedSlot: string; setSelectedSlot: (s: string) => void; go: (s: Screen) => void }) {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 5, 28));
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editDate,     setEditDate]     = useState(new Date(2026, 5, 28));
  const [editSlot,     setEditSlot]     = useState("10:30");
  const [bookings,     setBookings]     = useState(BOOKING_HISTORY);
  const [savedFlash,   setSavedFlash]   = useState(false);

  const upcoming = bookings.filter(b => b.status === "upcoming");
  const recent   = bookings.filter(b => b.status !== "upcoming");

  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const fmtDate = (d: Date) =>
    `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;

  const saveEdit = (id: string) => {
    setBookings(bs => bs.map(b => b.id === id
      ? { ...b, date: fmtDate(editDate), time: editSlot }
      : b
    ));
    setEditingId(null);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 3000);
  };

  const statusStyle: Record<string, string> = {
    upcoming:  "border-emerald-200 bg-emerald-100 text-emerald-700",
    completed: "border-border      bg-secondary    text-muted-foreground",
    cancelled: "border-red-200     bg-red-100      text-red-600",
  };

  return (
    <div>
      <button onClick={() => go("doctors")} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground sm:mb-5">
        <ArrowLeft className="size-4" /> Back to doctors
      </button>

      <ScreenTitle kicker="Appointment Booking" title="Book a visit" copy={`${doctor.name} · ${doctor.specialty}`} />

      {/* Calendar + slots + summary */}
      <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[1fr_1fr_280px]">
        {/* Calendar */}
        <div className="rounded-[2rem] border border-border bg-white p-5 sm:p-6">
          <p className="mb-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Select date</p>
          <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {WEEKDAYS[selectedDate.getDay()]}, {fmtDate(selectedDate)}
          </p>
        </div>

        {/* Time slots */}
        <div className="rounded-[2rem] border border-border bg-white p-5 sm:p-6">
          <p className="mb-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Select time</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {SLOTS.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-2xl border py-3.5 text-sm font-bold transition ${selectedSlot === slot ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-[2rem] bg-secondary p-5 sm:p-6">
          <Clock3 className="size-7 text-primary sm:size-8" />
          <h3 className="mt-3 text-lg font-bold sm:mt-4">Booking summary</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Patient</span>
              <span className="font-medium text-right">{PATIENT.firstName}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Doctor</span>
              <span className="font-medium text-right text-xs">{doctor.name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Room</span>
              <span className="font-medium">{doctor.room}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{fmtDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Time</span>
              <span className="font-mono font-bold text-primary">{selectedSlot}</span>
            </div>
          </div>
          <button onClick={() => go("confirmation")} className="mt-5 w-full rounded-2xl bg-accent px-5 py-4 text-sm font-bold text-accent-foreground transition hover:brightness-95 sm:mt-6">
            Confirm appointment
          </button>
        </div>
      </div>

      {/* Save flash */}
      {savedFlash && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="size-4" /> Booking updated successfully.
        </motion.div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">Upcoming appointments</h3>
            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />{upcoming.length} scheduled
            </span>
          </div>
          <div className="mt-3 grid gap-3">
            {upcoming.map(b => (
              <div key={b.id} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
                {/* Edit panel */}
                {editingId === b.id ? (
                  <div>
                    <p className="mb-4 text-sm font-bold">Edit booking — {b.id}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-white p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">New date</p>
                        <MiniCalendar selectedDate={editDate} onSelect={setEditDate} />
                        <p className="mt-3 text-center text-xs text-muted-foreground">{WEEKDAYS[editDate.getDay()]}, {fmtDate(editDate)}</p>
                      </div>
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">New time</p>
                        <div className="grid grid-cols-2 gap-2">
                          {SLOTS.map(slot => (
                            <button
                              key={slot}
                              onClick={() => setEditSlot(slot)}
                              className={`rounded-2xl border py-3 text-sm font-bold transition ${editSlot === slot ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white hover:bg-secondary"}`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 rounded-xl bg-secondary p-3 text-xs text-muted-foreground space-y-1">
                          <p><span className="font-semibold text-foreground">Doctor:</span> {b.doctor}</p>
                          <p><span className="font-semibold text-foreground">New date:</span> {fmtDate(editDate)}</p>
                          <p><span className="font-semibold text-foreground">New time:</span> {editSlot}</p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => saveEdit(b.id)} className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:brightness-95">
                            Save changes
                          </button>
                          <button onClick={() => setEditingId(null)} className="rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground transition hover:bg-secondary">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${b.color}`}>
                      <CalendarCheck className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold">{b.doctor}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.specialty} · {b.room}</p>
                      <p className="mt-0.5 font-mono text-xs font-semibold text-emerald-700">{b.date} at {b.time}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => { setEditDate(new Date(2026, 5, 28)); setEditSlot(b.time); setEditingId(b.id); }}
                        className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
                      >
                        <Pencil className="size-3" /> Edit
                      </button>
                      <button onClick={() => go("confirmation")} className="rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50">
                        View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="mt-8">
        <h3 className="text-lg font-bold">Recent bookings</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">Your last {recent.length} appointments</p>
        <div className="mt-3 grid gap-3">
          {recent.map(b => (
            <div key={b.id} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 sm:p-5">
              <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${b.color} opacity-70`}>
                <Stethoscope className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold">{b.doctor}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{b.specialty} · {b.room}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{b.date} at {b.time} · {b.id}</p>
              </div>
              {b.status === "completed" && (
                <button onClick={() => go("booking")} className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-secondary">
                  Rebook
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Confirmation({ doctor, slot, go }: { doctor: typeof DOCTORS_DATA[number]; slot: string; go: (s: Screen) => void }) {
  return (
    <div className="flex justify-center py-8 sm:py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-border bg-white p-6 text-center shadow-xl sm:p-8">
        <CheckCircle2 className="mx-auto size-16 text-emerald-600 sm:size-20" />
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.24em] text-emerald-700 sm:mt-6">Appointment confirmed</p>
        <h2 className="mt-3 text-2xl font-extrabold sm:mt-4 sm:text-4xl">You are booked for {slot}.</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-lg">{PATIENT.name} will meet {doctor.name} in {doctor.room}. A reminder has been added to the patient profile.</p>
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
          <button onClick={() => go("profile")} className="flex-1 rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-primary-foreground transition hover:brightness-95 sm:text-base">View records</button>
          <button onClick={() => go("dashboard")} className="flex-1 rounded-2xl border border-border px-5 py-4 text-sm font-bold transition hover:bg-secondary sm:text-base">Dashboard</button>
        </div>
      </div>
    </div>
  );
}

const RECORDS = [
  {
    id: "REC-001",
    title: "Annual checkup",
    summary: "Normal vitals",
    date: "15 Jun 2026",
    time: "09:15",
    doctor: "Dr. Olivier Ndayisaba",
    type: "General Medicine",
    room: "Wing A · 112",
    syncedAgo: 13,
    details: [
      { label: "Blood pressure", value: "116 / 74 mmHg", flag: "normal" },
      { label: "Heart rate",     value: "68 bpm",        flag: "normal" },
      { label: "Temperature",   value: "36.7 °C",       flag: "normal" },
      { label: "Weight",        value: "65 kg",          flag: "normal" },
      { label: "Height",        value: "172 cm",         flag: "normal" },
      { label: "BMI",           value: "21.9",           flag: "normal" },
      { label: "O₂ Saturation", value: "99 %",           flag: "normal" },
      { label: "Resp. rate",    value: "15 / min",       flag: "normal" },
    ],
    notes: "All vitals normal for a 20-year-old male. No acute concerns. Patient is physically active and diet is adequate. Advised to maintain hydration. Routine follow-up in 12 months or sooner if symptoms arise.",
    status: "normal",
  },
  {
    id: "REC-002",
    title: "Lab results",
    summary: "Cholesterol reviewed",
    date: "10 Jun 2026",
    time: "11:30",
    doctor: "Dr. Aline Mukamana",
    type: "Cardiology",
    room: "Wing B · 204",
    syncedAgo: 18,
    details: [
      { label: "Total cholesterol", value: "192 mg/dL",          flag: "normal" },
      { label: "LDL",              value: "118 mg/dL",           flag: "attention" },
      { label: "HDL",              value: "55 mg/dL",            flag: "normal" },
      { label: "Triglycerides",    value: "128 mg/dL",           flag: "normal" },
      { label: "Blood glucose",    value: "89 mg/dL",            flag: "normal" },
      { label: "HbA1c",           value: "5.0 %",               flag: "normal" },
      { label: "Creatinine",      value: "0.9 mg/dL",           flag: "normal" },
      { label: "Haemoglobin",     value: "14.8 g/dL",           flag: "normal" },
    ],
    notes: "Lipid profile is broadly within range for age. LDL slightly borderline — dietary review recommended (reduce processed fats, increase fibre). No medication required at this stage. Repeat lipid panel in 6 months.",
    status: "attention",
  },
  {
    id: "REC-003",
    title: "Prescription issued",
    summary: "Vitamin D supplement",
    date: "15 Jun 2026",
    time: "09:45",
    doctor: "Dr. Olivier Ndayisaba",
    type: "General Medicine",
    room: "Wing A · 112",
    syncedAgo: 13,
    details: [
      { label: "Medication",    value: "Vitamin D3 — 2000 IU", flag: "normal" },
      { label: "Dosage",        value: "1 capsule daily",       flag: "normal" },
      { label: "With food",     value: "Yes — morning meal",    flag: "normal" },
      { label: "Duration",      value: "90 days",               flag: "normal" },
      { label: "Refills",       value: "1 authorised",          flag: "normal" },
      { label: "Serum Vit D",   value: "17 ng/mL",             flag: "attention" },
    ],
    notes: "Serum 25-OH Vitamin D at 17 ng/mL confirms insufficiency (normal ≥ 30 ng/mL). Supplementation initiated. Patient advised to increase sun exposure where possible. Recheck serum level at the 3-month mark.",
    status: "normal",
  },
];

function Profile({ go }: { go: (s: Screen) => void }) {
  const [openId, setOpenId]         = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "attention">("all");
  const [clock, setClock]           = useState(() => new Date());
  const [syncing, setSyncing]       = useState(false);
  const [syncedAt, setSyncedAt]     = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setSyncedAt(new Date()); }, 1200);
  };

  const secsSinceSync = Math.floor((clock.getTime() - syncedAt.getTime()) / 1000);
  const syncLabel = secsSinceSync < 5 ? "just now" : secsSinceSync < 60 ? `${secsSinceSync}s ago` : `${Math.floor(secsSinceSync / 60)}m ago`;
  const timeStr   = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const flagStyle: Record<string, string> = {
    normal:    "text-foreground",
    attention: "text-amber-600 font-bold",
  };

  return (
    <div>
      {/* Header with live clock */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <ScreenTitle kicker="Patient Profile / Records" title={PATIENT.name} copy={`Age ${PATIENT.age} · Patient ID ${PATIENT.id}`} />
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
          <p className="font-mono text-xs text-muted-foreground">{timeStr}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-[300px_1fr]">
        {/* Health snapshot */}
        <div className="rounded-[2rem] bg-primary p-5 text-primary-foreground sm:p-6">
          <UserRound className="size-10 sm:size-12" />
          <h3 className="mt-4 text-xl font-bold sm:mt-5 sm:text-2xl">Health snapshot</h3>
          <div className="mt-3 space-y-2 text-sm text-white/80">
            <div className="flex justify-between"><span className="text-white/60">Blood type</span><span className="font-semibold">{PATIENT.bloodType}</span></div>
            <div className="flex justify-between"><span className="text-white/60">Age</span><span className="font-semibold">{PATIENT.age} years</span></div>
            <div className="flex justify-between"><span className="text-white/60">BMI</span><span className="font-semibold">21.9 — Normal</span></div>
            <div className="flex justify-between"><span className="text-white/60">Allergies</span><span className="font-semibold">None on record</span></div>
            <div className="flex justify-between"><span className="text-white/60">Last visit</span><span className="font-semibold">{PATIENT.lastVisit}</span></div>
            <div className="flex justify-between"><span className="text-white/60">Records</span><span className="font-semibold">{RECORDS.length} on file</span></div>
          </div>
          <div className="mt-5 h-px bg-white/15" />
          <p className="mt-3 text-xs text-white/50">📧 {PATIENT.email}</p>
          <button onClick={() => go("doctors")} className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-white/90 sm:mt-4 sm:text-base">
            Book follow-up
          </button>
        </div>

        {/* Records list */}
        <div className="rounded-[2rem] border border-border p-5 sm:p-6">
          {/* Records header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold sm:text-2xl">Recent records</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Synced {syncLabel} · Tap any record to expand
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={syncing}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              <motion.div animate={{ rotate: syncing ? 360 : 0 }} transition={{ duration: 0.8, repeat: syncing ? Infinity : 0, ease: "linear" }}>
                <Activity className="size-3.5" />
              </motion.div>
              {syncing ? "Syncing…" : "Refresh"}
            </button>
          </div>

          {/* Status summary pills — clickable filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => { setStatusFilter(statusFilter === "all" ? "all" : "all"); setStatusFilter("all"); setOpenId(null); }}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${statusFilter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground hover:border-border hover:text-foreground"}`}
            >
              All ({RECORDS.length})
            </button>
            <button
              onClick={() => { setStatusFilter(statusFilter === "normal" ? "all" : "normal"); setOpenId(null); }}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${statusFilter === "normal" ? "border-emerald-400 bg-emerald-500 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
            >
              {RECORDS.filter(r => r.status === "normal").length} normal
            </button>
            <button
              onClick={() => { setStatusFilter(statusFilter === "attention" ? "all" : "attention"); setOpenId(null); }}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${statusFilter === "attention" ? "border-amber-400 bg-amber-500 text-white" : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
            >
              {RECORDS.filter(r => r.status === "attention").length} needs attention
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {RECORDS.filter(r => statusFilter === "all" || r.status === statusFilter).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No records match this filter.</p>
            )}
            {RECORDS.filter(r => statusFilter === "all" || r.status === statusFilter).map((rec) => (
              <button
                key={rec.id}
                onClick={() => setOpenId(openId === rec.id ? null : rec.id)}
                className={`w-full rounded-2xl border text-left transition ${openId === rec.id ? "border-primary bg-primary/5" : "border-transparent bg-secondary hover:border-border"}`}
              >
                {/* Row */}
                <div className="flex items-center justify-between p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${rec.status === "attention" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold sm:text-base">{rec.title}</p>
                        {rec.status === "attention" && (
                          <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Review</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.summary} · {rec.date} at {rec.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-[10px] text-muted-foreground/60 sm:block">synced {rec.syncedAgo}d ago</span>
                    <motion.div animate={{ rotate: openId === rec.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded panel */}
                {openId === rec.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-4 sm:p-5">
                      {/* Meta row */}
                      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono font-semibold text-foreground">{rec.id}</span>
                        <span>·</span><span>{rec.doctor}</span>
                        <span>·</span><span>{rec.type}</span>
                        <span>·</span><span>{rec.room}</span>
                        <span>·</span><span>{rec.date} at {rec.time}</span>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {rec.details.map(d => (
                          <div key={d.label} className="rounded-xl border border-border bg-background px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d.label}</p>
                            <p className={`mt-0.5 text-sm ${flagStyle[d.flag]}`}>{d.value}</p>
                            {d.flag === "attention" && (
                              <p className="mt-0.5 text-[10px] text-amber-600">⚠ Review</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Doctor notes */}
                      <div className="mt-4 rounded-xl border border-border bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Doctor's notes — {rec.doctor}</p>
                        <p className="mt-1.5 text-sm leading-relaxed">{rec.notes}</p>
                      </div>

                      {/* Attention banner */}
                      {rec.status === "attention" && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <Activity className="mt-0.5 size-4 shrink-0 text-amber-600" />
                          <p className="text-xs font-medium text-amber-700">Follow-up recommended. Book an appointment to discuss these results with your doctor.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Notifications ────────────────────────────────────── */

const NOTIFS = [
  { id: 1, type: "appointment", title: "Appointment confirmed", body: "Your appointment with Dr. Dabanica Payne is confirmed for 28 Jun at 09:00.", time: "2 min ago", read: false, color: "bg-emerald-100 text-emerald-700" },
  { id: 2, type: "reminder",    title: "Upcoming appointment",  body: "Reminder: you have an appointment tomorrow at 09:00. Please arrive 10 minutes early.", time: "1 hr ago", read: false, color: "bg-sky-100 text-sky-700" },
  { id: 3, type: "record",      title: "Lab results available", body: "Your cholesterol lab results have been added to your medical records.", time: "2 days ago", read: true, color: "bg-amber-100 text-amber-700" },
  { id: 4, type: "system",      title: "Profile updated",       body: "Your patient profile was successfully updated on 15 Jun 2026.", time: "13 days ago", read: true, color: "bg-violet-100 text-violet-700" },
];

function Notifications({ go }: { go: (s: Screen) => void }) {
  const [notifs, setNotifs] = useState(NOTIFS);
  const unread = notifs.filter(n => !n.read).length;

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const dismiss = (id: number) => setNotifs(n => n.filter(x => x.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between">
        <ScreenTitle kicker="Notifications" title="Your alerts" copy={`${unread} unread notification${unread !== 1 ? "s" : ""}`} />
        {unread > 0 && (
          <button onClick={markAll} className="shrink-0 rounded-2xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground transition hover:bg-secondary">
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <AnimatePresence>
          {notifs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card px-5 py-12 text-center">
              <Bell className="mx-auto size-12 text-muted-foreground/30" />
              <p className="mt-4 text-sm font-semibold text-muted-foreground">No notifications</p>
            </motion.div>
          )}
          {notifs.map((n, i) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22, delay: i * 0.05 }}
              className={`rounded-2xl border p-4 sm:p-5 ${n.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${n.color}`}>
                  {n.type === "appointment" ? <CalendarCheck className="size-4" /> :
                   n.type === "reminder"    ? <Clock3 className="size-4" /> :
                   n.type === "record"      ? <FileText className="size-4" /> :
                                              <ShieldCheck className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{n.title}</p>
                    {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/60">{n.time}</p>
                </div>
                <button onClick={() => dismiss(n.id)} className="shrink-0 text-muted-foreground/50 transition hover:text-destructive">
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notifs.length > 0 && (
        <button onClick={() => setNotifs([])} className="mt-4 w-full rounded-2xl border border-border px-5 py-3 text-sm text-muted-foreground transition hover:bg-secondary hover:text-destructive">
          Clear all notifications
        </button>
      )}
    </div>
  );
}

/* ── Patient Settings ─────────────────────────────────── */

function PatientSettings({ isDark, toggleDark, go }: { isDark: boolean; toggleDark: () => void; go: (s: Screen) => void }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: PATIENT.firstName,
    lastName: "Mbayo",
    email: PATIENT.email,
    phone: "+250 788 420 000",
    language: "english",
    emailNotifs: true,
    smsNotifs: false,
    reminderHours: "24",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? (e as any).target.checked : e.target.value }));

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div>
      <ScreenTitle kicker="Settings" title="Account settings" copy="Manage your profile, preferences, and notification options." />

      <div className="mt-6 space-y-4 sm:mt-8">
        {/* Profile */}
        <div className="rounded-[2rem] border border-border bg-card p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold">Personal information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name" value={form.firstName} onChange={set("firstName")} placeholder="First name" />
            <FormField label="Last name"  value={form.lastName}  onChange={set("lastName")}  placeholder="Last name" />
          </div>
          <FormField label="Email address" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" icon={<Mail className="size-4 text-muted-foreground" />} />
          <FormField label="Phone number"  type="tel"   value={form.phone} onChange={set("phone")} placeholder="+250 700 000 000" icon={<Phone className="size-4 text-muted-foreground" />} />
        </div>

        {/* Appearance */}
        <div className="rounded-[2rem] border border-border bg-card p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold">Appearance</h3>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary px-4 py-3.5">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="size-5 text-primary" /> : <Sun className="size-5 text-amber-500" />}
              <div>
                <p className="text-sm font-medium">{isDark ? "Dark mode" : "Light mode"}</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
              </div>
            </div>
            <button onClick={toggleDark} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? "bg-primary" : "bg-border"}`}>
              <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground">Language</label>
            <select value={form.language} onChange={set("language")} className="mt-2 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-primary transition">
              <option value="english">English</option>
              <option value="french">Français</option>
              <option value="kinyarwanda">Kinyarwanda</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-[2rem] border border-border bg-card p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold">Notification preferences</h3>
          {[
            { key: "emailNotifs" as const, label: "Email notifications", desc: "Receive appointment confirmations by email" },
            { key: "smsNotifs"   as const, label: "SMS notifications",   desc: "Receive SMS reminders for upcoming visits" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-2xl border border-border bg-secondary px-4 py-3.5">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form[key] ? "bg-primary" : "bg-border"}`}>
                <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${form[key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
          <div>
            <label className="block text-sm text-muted-foreground">Reminder timing</label>
            <select value={form.reminderHours} onChange={set("reminderHours")} className="mt-2 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-primary transition">
              <option value="1">1 hour before</option>
              <option value="3">3 hours before</option>
              <option value="24">24 hours before</option>
              <option value="48">48 hours before</option>
            </select>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-[2rem] border border-border bg-card p-5 sm:p-6 space-y-3">
          <h3 className="text-base font-bold">Quick access</h3>
          {[
            { label: "View medical records",  icon: FileText,    action: () => go("profile") },
            { label: "View notifications",    icon: Bell,        action: () => go("notifications") },
            { label: "Book an appointment",   icon: CalendarCheck, action: () => go("doctors") },
          ].map(({ label, icon: Icon, action }) => (
            <button key={label} onClick={action} className="flex w-full items-center gap-3 rounded-2xl bg-secondary px-4 py-3.5 text-sm font-medium text-left transition hover:bg-accent">
              <Icon className="size-4 text-primary" />{label}<ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} className="rounded-2xl bg-primary px-6 py-3.5 font-bold text-primary-foreground transition hover:brightness-95">
            Save changes
          </button>
          {saved && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="size-4" /> Changes saved
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared primitives ────────────────────────────────── */

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground sm:size-12"><HeartPulse className="size-5 sm:size-6" /></div>
      {!compact && <div><h1 className="text-lg font-extrabold leading-none sm:text-xl">MediBridge</h1><p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Hospital Management</p></div>}
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: { label: string; icon: ElementType }; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
      <span className="flex items-center gap-3"><Icon className="size-5" />{item.label}</span><ChevronRight className="size-4" />
    </button>
  );
}

function ScreenTitle({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">{kicker}</p>
      <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:mt-3 sm:text-base lg:text-lg">{copy}</p>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 sm:p-4">
      <p className="text-2xl font-extrabold sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs text-white/65 sm:text-sm">{label}</p>
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="mt-2 flex items-center justify-between rounded-2xl border border-border bg-secondary px-4 py-3.5 sm:py-4">
        <span className="text-sm sm:text-base">{value}</span>{icon}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, error, options }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground">{label}</label>
      <select value={value} onChange={onChange} className={`mt-2 w-full rounded-2xl border bg-secondary px-4 py-3 text-sm outline-none transition focus:border-primary sm:py-3.5 sm:text-base ${error ? "border-destructive" : "border-border"}`}>
        <option value="">Select…</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, error, type = "text", icon }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; error?: string; type?: string; icon?: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground">{label}</label>
      <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-secondary px-4 py-3 sm:py-3.5 ${error ? "border-destructive" : "border-border"} focus-within:border-primary transition`}>
        {icon}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="flex-1 bg-transparent text-sm outline-none sm:text-base placeholder:text-muted-foreground/60" />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Service({ icon: Icon, title, copy, onClick }: { icon: ElementType; title: string; copy: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-[1.5rem] border border-border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xl sm:p-5">
      <Icon className="size-7 text-primary sm:size-8" />
      <h3 className="mt-3 text-base font-bold sm:mt-5 sm:text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground sm:mt-2">{copy}</p>
    </button>
  );
}

export default App;
