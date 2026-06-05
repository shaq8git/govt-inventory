import { useEffect, useRef, useState } from "react";
import LoginPage from "./components/LoginPage.jsx";
import HeadOffice from "./components/HeadOffice.jsx";
import DistrictOffice from "./components/DistrictOffice.jsx";
import CircleOffice from "./components/CircleOffice.jsx";
import OfficeList from "./components/OfficeList.jsx";
import Designation from "./components/Designation.jsx";
import Distribution from "./components/Distribution.jsx";
import StockRegister from "./components/StockRegister.jsx";
import UserRegistration from "./components/UserRegistration.jsx";
import ProductGroup from "./components/ProductGroup.jsx";
import ProductList from "./components/ProductList.jsx";
import MfgCompany from "./components/MfgCompany.jsx";
import MonthCycle from "./components/MonthCycle.jsx";
import ProductOpeningBalance from "./components/ProductOpeningBalance.jsx";
import Supplier from "./components/Supplier.jsx";
import Customer from "./components/Customer.jsx";
import PurchaseReturns from "./components/PurchaseReturns.jsx";
import SalesReturns from "./components/SalesReturns.jsx";
import Damage from "./components/Damage.jsx";
import PurchaseReport from "./components/PurchaseReport.jsx";
import DailyPurchaseInvoice from "./components/DailyPurchaseInvoice.jsx";
import DailyPurchaseSummary from "./components/DailyPurchaseSummary.jsx";
import Requisition from "./components/Requisition.jsx";
import RequisitionList from "./components/RequisitionList.jsx";
import ApprovedRequisition from "./components/ApprovedRequisition.jsx";
import SalesReport from "./components/SalesReport.jsx";
import DailySalesInvoice from "./components/DailySalesInvoice.jsx";
import DailySalesSummary from "./components/DailySalesSummary.jsx";
import PurchaseSalesReport from "./components/PurchaseSalesReport.jsx";

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

function IconBuilding({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V7l7-4 7 4v14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-5h6v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h2M13 10h2M9 14h2M13 14h2" />
    </svg>
  );
}

function IconMapPin({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconMap({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v15M15 6v15" />
    </svg>
  );
}

function IconBriefcase({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="2" y="8" width="20" height="13" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 13h20" />
    </svg>
  );
}

function IconBadge({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3a3 3 0 1 1 6 0H9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4" />
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
      { id: "head-office", label: "Head Office", icon: IconBuilding },
      { id: "circle-office", label: "Circle Office", icon: IconMapPin },
      { id: "district-office", label: "District Office", icon: IconMap },
      { id: "office", label: "Office", icon: IconBriefcase },
      { id: "designation", label: "Designation", icon: IconBadge },
      { id: "month-cycle", label: "Month Cycle", icon: IconChart },
    ],
  },
  {
    id: "product",
    label: "Product",
    icon: IconBox,
    items: [
      { id: "product-group", label: "Product Group", icon: IconFolder },
      { id: "mfc-company", label: "Manufacture Company", icon: IconTruck },
      { id: "product-information", label: "Product Information", icon: IconClipboard },
      { id: "product-opening-balance", label: "Product Opening Balance", icon: IconBalance },
      { id: "supplier", label: "Supplier", icon: IconBriefcase },
      { id: "customer", label: "Customer", icon: IconBriefcase },
    ],
  },
  {
    id: "transaction",
    label: "Transaction",
    icon: IconTruck,
    items: [
      { id: "stock-register", label: "Stock Register / Purchase", icon: IconBox },
      { id: "distribution", label: "Item Distribution", icon: IconTruck },
      { id: "purchase-returns", label: "Purchase Returns", icon: IconTruck },
      { id: "sales-returns", label: "Sales Returns", icon: IconTruck },
      { id: "damage", label: "Damage", icon: IconTruck },
      { id: "requisition", label: "Requisition", icon: IconClipboard },
      { id: "requisition-list", label: "Requisition List", icon: IconClipboard },
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
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: IconChart,
    items: [
      { id: "purchase-report", label: "Purchase Report", icon: IconClipboard },
      { id: "daily-purchase-invoice", label: "Daily Purchase Invoice", icon: IconClipboard },
      { id: "daily-purchase-summary", label: "Daily Purchase Summary", icon: IconClipboard },
      { id: "sales-report", label: "Sales Report", icon: IconClipboard },
      { id: "daily-sales-invoice", label: "Daily Sales Invoice", icon: IconClipboard },
      { id: "daily-sales-summary", label: "Daily Sales Summary", icon: IconClipboard },
      { id: "purchase-sales-report", label: "Purchase & Sales Report", icon: IconClipboard },
      { id: "approved-requisition", label: "Approved Requisition", icon: IconClipboard },
    ],
  },
];

function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Overview</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-base text-slate-600">
          Welcome to the inventory management system.
        </p>
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
    case "head-office":
      return <HeadOffice />;
    case "circle-office":
      return <CircleOffice />;
    case "district-office":
      return <DistrictOffice />;
    case "office":
      return <OfficeList />;
    case "designation":
      return <Designation />;
    case "month-cycle":
      return <MonthCycle />;
    case "product-group":
      return <ProductGroup />;
    case "mfc-company":
      return <MfgCompany />;
    case "product-information":
      return <ProductList />;
    case "product-opening-balance":
      return <ProductOpeningBalance />;
    case "supplier":
      return <Supplier />;
    case "customer":
      return <Customer />;
    case "stock-register":
      return <StockRegister />;
    case "distribution":
      return <Distribution />;
    case "purchase-returns":
      return <PurchaseReturns />;
    case "sales-returns":
      return <SalesReturns />;
    case "damage":
      return <Damage />;
    case "requisition":
      return <Requisition />;
    case "requisition-list":
      return <RequisitionList />;
    case "purchase-report":
      return <PurchaseReport />;
    case "daily-purchase-invoice":
      return <DailyPurchaseInvoice />;
    case "daily-purchase-summary":
      return <DailyPurchaseSummary />;
    case "sales-report":
      return <SalesReport />;
    case "daily-sales-invoice":
      return <DailySalesInvoice />;
    case "daily-sales-summary":
      return <DailySalesSummary />;
    case "purchase-sales-report":
      return <PurchaseSalesReport />;
    case "approved-requisition":
      return <ApprovedRequisition />;
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
      return <DashboardPage />;
    case "user-registration":
      return <UserRegistration onRegistered={handlers.onRegistered} />;
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
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({
    basic: false,
    product: false,
    transaction: false,
    users: false,
    reports: false,
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("storeAuthToken");
    if (!storedToken) {
      setAuthChecking(false);
      return;
    }
    fetch("/api/users/me/", {
      headers: { Authorization: `Token ${storedToken}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((user) => {
        setAuthUser(user);
        setIsLoggedIn(true);
      })
      .catch(() => {
        sessionStorage.removeItem("storeAuthToken");
        sessionStorage.removeItem("storeAuthUser");
      })
      .finally(() => setAuthChecking(false));
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
    sessionStorage.setItem("storeAuthToken", data.token);
    sessionStorage.setItem("storeAuthUser", JSON.stringify(data.user));
    setAuthUser(data.user);
    setIsLoggedIn(true);
    setPage("dashboard");
  }

  function handleRegistered() {
    setPage("user-registration");
    setOpenMenus((m) => ({ ...m, users: true }));
  }

  function handleLogout() {
    sessionStorage.removeItem("storeAuthToken");
    sessionStorage.removeItem("storeAuthUser");
    setAuthUser(null);
    setIsLoggedIn(false);
    setProfileOpen(false);
  }

  const displayName =
    authUser?.first_name || authUser?.last_name
      ? `${authUser?.first_name || ""} ${authUser?.last_name || ""}`.trim()
      : authUser?.username || "Admin User";

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <aside className="hidden w-[312px] shrink-0 border-r border-slate-200/80 bg-slate-950 px-3 py-3 text-slate-100 shadow-[24px_0_80px_rgba(15,23,42,0.14)] lg:flex lg:flex-col">
            <img
              src="/images/govLogo3.webp"
              alt="Government logo"
              className="h-[104px] w-full object-contain"
            />

            <nav className="mt-6 flex-1 space-y-3 overflow-y-auto">
              <button
                type="button"
                onClick={() => setPage("dashboard")}
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

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                {/* User profile button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((current) => !current)}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-cyan-700"
                  >
                    {avatar ? (
                      <img src={avatar} alt="Profile avatar" className="h-9 w-9 rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="hidden text-left sm:block">
                      <span className="block text-sm font-semibold text-slate-900">{displayName}</span>
                      <span className="block text-xs text-slate-500">Signed in</span>
                    </span>
                    <IconChevron open={profileOpen} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                      <button
                        type="button"
                        onClick={() => { fileInputRef.current?.click(); setProfileOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                      >
                        <IconProfile className="h-4 w-4" />
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                      >
                        <IconProfile className="h-4 w-4" />
                        Profile
                      </button>
                    </div>
                  )}
                </div>

                {/* Logout button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-[46px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-400 hover:text-rose-600"
                >
                  <IconLogin className="h-4 w-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">{renderContent(page, { onAuth: handleAuth, onRegistered: handleRegistered })}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
