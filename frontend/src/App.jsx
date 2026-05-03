import { useEffect, useRef, useState } from "react";
import LoginPage from "./components/LoginPage.jsx";
import StockAdd from "./components/StockAdd.jsx";
import StockDistribution from "./components/StockDistribution.jsx";
import StockRegister from "./components/StockRegister.jsx";
import UserRegistration from "./components/UserRegistration.jsx";

function IconMenu({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconChevron({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 transition ${open ? "rotate-90" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m7 4 6 6-6 6" />
    </svg>
  );
}

function IconBox({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7.5 8 4.5 8-4.5" />
    </svg>
  );
}

function IconLayers({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 12 8 4 8-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 16 8 4 8-4" />
    </svg>
  );
}

function IconUsers({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 19a4 4 0 0 0-8 0" />
      <circle cx="12" cy="11" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a4 4 0 0 0-3-3.87" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 19a4 4 0 0 1 3-3.87" />
    </svg>
  );
}

function IconFolder({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8.5A2.5 2.5 0 0 1 5.5 6H9l2 2h7.5A2.5 2.5 0 0 1 21 10.5v7A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9Z"
      />
    </svg>
  );
}

function IconClipboard({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8v4H8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

function IconBalance({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 8-3 6h6l-3-6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16 8-3 6h6l-3-6Z" />
    </svg>
  );
}

function IconChart({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 15V9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 15v-3" />
    </svg>
  );
}

function IconTruck({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v8H3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h3l4 3v2h-7" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  );
}

function IconUserCog({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="10" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19a6 6 0 0 1 12 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m17 10 .7 1.3 1.5.3-1 1 .2 1.4-1.4-.7-1.3.7.2-1.4-1-1 1.5-.3L17 10Z" />
    </svg>
  );
}

function IconShield({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v6c0 4.2 2.6 7.8 7 9 4.4-1.2 7-4.8 7-9V6l-7-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 12 1.7 1.7 3.3-3.7" />
    </svg>
  );
}

function IconHome({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12 12 4l9 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function IconProfile({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}

function IconLogin({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17 15 12 10 7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4" />
    </svg>
  );
}

const menuGroups = [
  {
    id: "basic",
    label: "Basic Setup",
    icon: IconLayers,
    items: [
      { id: "product-group", label: "Product Group", icon: IconFolder },
      { id: "product-information", label: "Product Information", icon: IconClipboard },
      { id: "product-opening-balance", label: "Product Opening Balance", icon: IconBalance },
    ],
  },
  {
    id: "transaction",
    label: "Transaction",
    icon: IconBox,
    items: [
      { id: "stock-register", label: "Stock Register", icon: IconBox },
      { id: "distribution", label: "Distribution", icon: IconTruck },
      { id: "purchase-planning", label: "Purchase Planning", icon: IconChart },
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: IconUsers,
    items: [
      { id: "user-registration", label: "User Registration", icon: IconProfile },
      { id: "user-role", label: "User Role", icon: IconUserCog },
      { id: "user-permission", label: "User Permission", icon: IconShield },
      { id: "login", label: "Login", icon: IconLogin },
    ],
  },
];

function DashboardPage({ registeredUser }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        {registeredUser ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Registration Successful
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Welcome, {registeredUser.username}
            </h1>
            <p className="mt-2 text-base text-slate-600">You are registered.</p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Overview</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
            <p className="mt-2 text-base text-slate-600">
              Welcome to the store management system.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function PlaceholderPage({ eyebrow, title, description, stats }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">{eyebrow}</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-lg shadow-slate-950/15">
            Admin workflow panel
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function renderContent(page, handlers) {
  switch (page) {
    case "product-group":
      return (
        <PlaceholderPage
          eyebrow="Basic Setup"
          title="Product Group"
          description="Create and organize product groups before item-level stock entries are added into the system."
          stats={[
            { label: "Groups", value: "12", detail: "Active categories mapped to the store structure." },
            { label: "Pending", value: "03", detail: "Groups awaiting item assignment." },
            { label: "Updated", value: "Today", detail: "Most recent setup activity recorded." },
          ]}
        />
      );
    case "product-information":
      return <StockAdd />;
    case "product-opening-balance":
      return (
        <PlaceholderPage
          eyebrow="Basic Setup"
          title="Product Opening Balance"
          description="Define opening stock balances for the fiscal year and keep the baseline aligned with purchase and distribution records."
          stats={[
            { label: "Fiscal Year", value: "2026", detail: "Current opening balance session." },
            { label: "Imported", value: "148", detail: "Items with opening quantity prepared." },
            { label: "Variance", value: "0.00", detail: "No mismatches detected in the draft sheet." },
          ]}
        />
      );
    case "stock-register":
      return <StockRegister />;
    case "distribution":
      return <StockDistribution />;
    case "purchase-planning":
      return (
        <PlaceholderPage
          eyebrow="Transaction"
          title="Purchase Planning"
          description="Prepare procurement planning from current stock position, projected distribution volume, and upcoming replenishment needs."
          stats={[
            { label: "Planned", value: "08", detail: "Purchase plans in preparation." },
            { label: "Priority", value: "High", detail: "Critical items flagged for quick action." },
            { label: "Coverage", value: "45 Days", detail: "Estimated stock cover from current planning." },
          ]}
        />
      );
    case "dashboard":
      return <DashboardPage registeredUser={handlers.lastRegistered} />;
    case "user-registration":
      return <UserRegistration onRegistered={handlers.onRegistered} />;
    case "login":
      return <LoginPage onLogin={handlers.onAuth} />;
    case "user-role":
      return (
        <PlaceholderPage
          eyebrow="Users"
          title="User Role"
          description="Assign responsibilities across store entry, review, approval, and reporting with clear role boundaries."
          stats={[
            { label: "Roles", value: "06", detail: "Configured role definitions." },
            { label: "Mapped", value: "21", detail: "Users assigned to at least one role." },
            { label: "Review", value: "02", detail: "Roles waiting for policy review." },
          ]}
        />
      );
    case "user-permission":
      return (
        <PlaceholderPage
          eyebrow="Users"
          title="User Permission"
          description="Fine-tune access to stock setup, transactions, and approval actions from a single permission workspace."
          stats={[
            { label: "Policies", value: "18", detail: "Permission rules currently enforced." },
            { label: "Critical", value: "04", detail: "Restricted actions requiring approval." },
            { label: "Audit", value: "Clean", detail: "No permission conflicts flagged." },
          ]}
        />
      );
    default:
      return null;
  }
}

export default function App() {
  const [page, setPage] = useState("distribution");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({
    basic: true,
    transaction: true,
    users: true,
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastRegistered, setLastRegistered] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("storeAuthUser");
    const storedToken = localStorage.getItem("storeAuthToken");
    if (storedUser && storedToken) {
      setAuthUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  function toggleMenu(menuId) {
    setOpenMenus((current) => ({
      ...current,
      [menuId]: !current[menuId],
    }));
  }

  function handleAvatarChange(event) {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    setAvatar(URL.createObjectURL(file));
  }

  function handleAuth(data) {
    localStorage.setItem("storeAuthToken", data.token);
    localStorage.setItem("storeAuthUser", JSON.stringify(data.user));
    setAuthUser(data.user);
    setIsLoggedIn(true);
    setPage("distribution");
  }

  function handleRegistered(data) {
    localStorage.setItem("storeAuthToken", data.token);
    localStorage.setItem("storeAuthUser", JSON.stringify(data.user));
    setAuthUser(data.user);
    setIsLoggedIn(true);
    setLastRegistered(data.user);
    setPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("storeAuthToken");
    localStorage.removeItem("storeAuthUser");
    setAuthUser(null);
    setIsLoggedIn(false);
    setProfileOpen(false);
    setPage("login");
  }

  const displayName =
    authUser?.first_name || authUser?.last_name
      ? `${authUser?.first_name || ""} ${authUser?.last_name || ""}`.trim()
      : authUser?.username || "Admin User";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <aside className="hidden w-[312px] shrink-0 border-r border-slate-200/80 bg-slate-950 px-3 py-3 text-slate-100 shadow-[24px_0_80px_rgba(15,23,42,0.14)] lg:flex lg:flex-col">
            <img
              src="/images/govLogo2.png"
              alt="Government logo"
              className="h-[104px] w-full object-contain"
            />

            <nav className="mt-6 flex-1 space-y-3 overflow-y-auto">
              <button
                type="button"
                onClick={() => { setPage("dashboard"); setLastRegistered(null); }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                  page === "dashboard"
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-cyan-300">
                  <IconHome className="h-5 w-5" />
                </span>
                <span className="font-semibold">Dashboard</span>
              </button>

              {menuGroups.map((group) => {
                const GroupIcon = group.icon;
                const isOpen = openMenus[group.id];

                return (
                  <div key={group.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-2">
                    <button
                      type="button"
                      onClick={() => toggleMenu(group.id)}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/5"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-cyan-300">
                          <GroupIcon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-white">{group.label}</span>
                          <span className="block text-xs text-slate-400">{group.items.length} items</span>
                        </span>
                      </span>
                      <span className="text-slate-400">
                        <IconChevron open={isOpen} />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="mt-1 space-y-1 pb-2">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const active = page === item.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setPage(item.id)}
                              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                                active
                                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <ItemIcon className="h-4 w-4" />
                              <span className="font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-300 bg-green-200 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen((current) => !current)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-gray-200 text-slate-700 shadow-sm transition hover:border-cyan-700 hover:text-cyan-700"
                  aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  <IconMenu />
                </button>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">Government of Bangladesh</p>
                  <h1 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                    Directorate of Education Engineering
                  </h1>
                </div>
              </div>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-cyan-700"
                >
                  {avatar ? (
                    <img src={avatar} alt="Profile avatar" className="h-11 w-11 rounded-2xl object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                      DE
                    </span>
                  )}
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-semibold text-slate-900">{displayName}</span>
                    <span className="block text-xs text-slate-500">
                      {isLoggedIn ? "Signed in" : "Signed out"}
                    </span>
                  </span>
                  <IconChevron open={profileOpen} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-300"
                    >
                      <IconProfile className="h-4 w-4" />
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-300"
                    >
                      <IconProfile className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isLoggedIn) {
                          handleLogout();
                        } else {
                          setPage("login");
                          setProfileOpen(false);
                        }
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-300"
                    >
                      <IconLogin className="h-4 w-4" />
                      {isLoggedIn ? "Logout" : "Login"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">{renderContent(page, { onAuth: handleAuth, onRegistered: handleRegistered, lastRegistered })}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
