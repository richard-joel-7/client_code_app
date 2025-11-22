import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import ProjectModal from "../components/ProjectModal";
import api from "../lib/api";
import { Plus, LogOut, Search, Download, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

const logo = "/pixoo-black-logo.png";

export default function MarketingDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [search, setSearch] = useState("");
    const [filterBrand, setFilterBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProjects();
    }, [search, filterBrand]);

    const fetchProjects = async () => {
        try {
            setError("");
            const params = {};
            if (search) params.client_name = search;
            if (filterBrand) params.brand = filterBrand;
            const res = await api.get("/marketing/projects", { params });
            if (Array.isArray(res.data)) {
                setProjects(res.data);
            } else {
                setProjects([]);
                console.error("API returned non-array data:", res.data);
            }
        } catch (err) {
            console.error("Failed to fetch projects", err);
            setError("Failed to load projects. Please try again.");
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSave = async (data) => {
        if (editingProject) {
            await api.put(`/marketing/projects/${editingProject.master_id}`, data);
        } else {
            await api.post("/marketing/projects", data);
        }
        fetchProjects();
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleExport = async () => {
        try {
            const response = await api.get("/marketing/projects/export", {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'projects.csv');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error("Export failed", err);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 text-gray-100 font-sans selection:bg-primary/30">
            {/* Top Bar */}
            <header className="border-b border-white/10 bg-dark-800/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                            <img src={logo} alt="PhantomFX" className="h-6" />
                        </div>
                        <div className="h-6 w-px bg-white/10 mx-2"></div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Marketing <span className="text-primary">Hub</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-300">Welcome, <span className="text-white font-bold">{user?.username}</span></span>
                        </div>
                        <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Stats / Hero Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/30 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-primary/40"></div>
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Clients</h3>
                        <div className="text-4xl font-bold text-white">{new Set((projects || []).map(p => p.client_code)).size}</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-blue-500/20"></div>
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Global Clients</h3>
                        <div className="text-4xl font-bold text-white">{new Set((projects || []).filter(p => p.region === 'Global').map(p => p.client_code)).size}</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-orange-500/20"></div>
                        <h3 className="text-gray-400 text-sm font-medium mb-2">India Clients</h3>
                        <div className="text-4xl font-bold text-white">{new Set((projects || []).filter(p => p.region === 'India').map(p => p.client_code)).size}</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-purple-500/20"></div>
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Brands</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries((projects || []).reduce((acc, p) => {
                                const b = p.brand || "Unknown";
                                acc[b] = (acc[b] || 0) + 1;
                                return acc;
                            }, {})).map(([brand, count]) => (
                                <button
                                    key={brand}
                                    onClick={() => setFilterBrand(brand === filterBrand ? null : brand)}
                                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filterBrand === brand
                                        ? "bg-primary text-black border-primary font-bold"
                                        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                                        }`}
                                >
                                    {brand}: {count}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search Client Name..."
                            className="pl-12 bg-dark-800/50 border-white/5 focus:bg-dark-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="secondary" onClick={handleExport} className="shadow-none bg-dark-800 hover:bg-dark-700 border-white/5">
                            <Download size={18} /> Export
                        </Button>
                        <Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
                            <Plus size={18} /> New Project
                        </Button>
                    </div>
                </div>

                {/* Projects Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-gray-400 font-medium uppercase tracking-wider text-xs border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-5">Client Code</th>
                                    <th className="px-6 py-5">Client Name</th>
                                    <th className="px-6 py-5">Brand</th>
                                    <th className="px-6 py-5">Project Name</th>
                                    <th className="px-6 py-5">Region</th>
                                    <th className="px-6 py-5">Show Code</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-12 text-gray-500">Loading data...</td></tr>
                                ) : (projects || []).length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-12 text-gray-500">No projects found</td></tr>
                                ) : (
                                    (projects || []).map((p, i) => (
                                        <motion.tr
                                            key={p.master_id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-mono font-bold text-primary tracking-wider group-hover:text-white transition-colors">{p.client_code}</td>
                                            <td className="px-6 py-4 font-medium text-white">{p.client_name}</td>
                                            <td className="px-6 py-4 text-gray-300">{p.brand || "-"}</td>
                                            <td className="px-6 py-4 text-gray-300">{p.project_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full bg-white/5 text-gray-300 text-xs font-medium border border-white/10 group-hover:border-primary/30 group-hover:text-primary transition-all">
                                                    {p.region}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-mono">{p.show_code}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} className="text-gray-500 hover:text-white hover:bg-white/10">
                                                    <Edit2 size={16} />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={editingProject}
                onSave={handleSave}
            />
        </div>
    );
}
