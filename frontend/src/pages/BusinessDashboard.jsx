import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    BarChart3, TrendingUp, DollarSign, PieChart, Activity,
    Calendar, ArrowUpRight, ArrowDownRight, Filter, ArrowLeft, LogOut,
    Layers, Users, Map, FileText
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend, LineChart, Line,
    FunnelChart, Funnel, LabelList
} from 'recharts';
import api from "../lib/api";

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function BusinessDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Filters (Slicers)
    const [filters, setFilters] = useState({
        year: "FY25-26",
        region: "All",
        territory: "All",
        status: "All"
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/business/analytics");
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch business analytics", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} />;

    const { kpis, charts } = data;

    // Tabs Configuration
    const tabs = [
        { id: "overview", label: "Overview", icon: Layers },
        { id: "client", label: "Client Dist.", icon: Users },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "financials", label: "Financials", icon: DollarSign },
        { id: "regional", label: "Regional", icon: Map },
    ];

    return (
        <div className="min-h-screen bg-dark-950 text-white flex flex-col overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="bg-dark-900 border-b border-white/5 p-4 flex justify-between items-center z-20 shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/hub-selection")} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-purple-400">Business Hub</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-white">Dashboard</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500 hidden md:block">
                        Last Refreshed: {new Date(kpis.last_refreshed).toLocaleString()}
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors border border-red-500/20">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Slicer Panel (Sidebar) */}
                <aside className="w-64 bg-dark-900/50 border-r border-white/5 p-4 hidden md:flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Filter size={12} /> Filters
                        </h3>

                        {/* Year Slicer */}
                        <div className="mb-4">
                            <label className="text-sm text-gray-400 mb-2 block">Fiscal Year</label>
                            <div className="flex flex-col gap-2">
                                {["FY24-25", "FY25-26"].map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setFilters({ ...filters, year: y })}
                                        className={`px-3 py-2 text-sm rounded-lg text-left transition-all ${filters.year === y ? "bg-purple-500 text-white" : "bg-dark-800 text-gray-400 hover:bg-dark-700"}`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Region Slicer */}
                        <div className="mb-4">
                            <label className="text-sm text-gray-400 mb-2 block">Region</label>
                            <select
                                className="w-full bg-dark-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                value={filters.region}
                                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                            >
                                <option value="All">All Regions</option>
                                <option value="International">International</option>
                                <option value="Domestic">Domestic</option>
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Tabs Header */}
                    <div className="flex items-center gap-1 p-2 bg-dark-900/30 border-b border-white/5 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {activeTab === "overview" && <OverviewTab kpis={kpis} charts={charts} />}
                                {activeTab === "client" && <ClientTab charts={charts} />}
                                {activeTab === "analytics" && <AnalyticsTab charts={charts} />}
                                {activeTab === "financials" && <FinancialsTab charts={charts} />}
                                {activeTab === "regional" && <RegionalTab charts={charts} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function OverviewTab({ kpis, charts }) {
    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Awarded Value" value={kpis.awarded_value} icon={DollarSign} color="text-emerald-400" bg="bg-emerald-500/10" />
                <KPICard title="Awarded Count" value={kpis.awarded_count} icon={Activity} color="text-blue-400" bg="bg-blue-500/10" isCount />
                <KPICard title="Opportunity Value" value={kpis.opportunity_value} icon={TrendingUp} color="text-amber-400" bg="bg-amber-500/10" />
                <KPICard title="Potential %" value={`${kpis.potential_pct}%`} icon={PieChart} color="text-purple-400" bg="bg-purple-500/10" isCount />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Funnel Chart */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-6">Pipeline Funnel</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                <Funnel
                                    data={charts.funnel}
                                    dataKey="value"
                                    nameKey="name"
                                    isAnimationActive
                                >
                                    <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-6">Revenue Trend (FY25-26)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.revenue_trend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                <Area type="monotone" dataKey="FY25-26" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ClientTab({ charts }) {
    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 h-full">
            <h3 className="text-lg font-semibold mb-6">Top Clients by Revenue</h3>
            <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.revenue_by_client} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={150} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                        <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function AnalyticsTab({ charts }) {
    return (
        <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Advanced Analytics Module</p>
                <p className="text-xs mt-2">Win/Loss Analysis & Trend Forecasting</p>
            </div>
        </div>
    );
}

function FinancialsTab({ charts }) {
    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold mb-6">Quarterly Performance</h3>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.quarterly_performance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function RegionalTab({ charts }) {
    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 h-full">
            <h3 className="text-lg font-semibold mb-6">Revenue by Region</h3>
            <div className="h-[400px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                            data={charts.revenue_by_region}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {charts.revenue_by_region.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                        <Legend />
                    </RePieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, bg, isCount }) {
    const formattedValue = isCount ? value : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: "compact",
        compactDisplay: "short"
    }).format(value);

    return (
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 w-20 h-20 ${bg} rounded-bl-full -mr-6 -mt-6 transition-all group-hover:scale-110 opacity-50`}></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`p-2.5 ${bg} rounded-xl ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
            <h3 className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">{title}</h3>
            <div className="text-xl font-bold text-white tracking-tight">{formattedValue}</div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
}

function ErrorScreen({ error }) {
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center text-red-400">
            {error}
        </div>
    );
}
