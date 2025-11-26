import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { X, Sparkles, RefreshCw } from "lucide-react";
import api from "../lib/api";

export default function ProjectModal({ isOpen, onClose, project, onSave, mode = 'new' }) {
    const [formData, setFormData] = useState({
        client_name: "",
        region: "",
        territory: "",
        currency: "",
        show_code: "",
        project_name: "",
        misc_info: "",
        source: "",
        brand: "",
        country: ""
    });
    const [previewCode, setPreviewCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [previewError, setPreviewError] = useState("");

    // Dropdown options for Existing Client mode
    const [clientNames, setClientNames] = useState([]);
    const [miscInfos, setMiscInfos] = useState([]);

    // Options
    const regionOptions = [
        { value: "Domestic", label: "Domestic" },
        { value: "International", label: "International" }
    ];

    const territoryOptions = {
        "Domestic": ["Chennai", "Hyderabad", "Mumbai", "Bangalore"],
        "International": ["USA", "UK", "Canada", "Europe", "China", "Others"]
    };

    const miscInfoOptions = ["ID", "TS", "NX", "SP", "MK", "00"];
    const brandOptions = ["PFX", "Milk", "Spectre", "Lola", "Tippett"];

    useEffect(() => {
        if (project) {
            setFormData(project);
            setPreviewCode(project.client_code);
        } else {
            setFormData({
                client_name: "",
                region: "",
                territory: "",
                currency: "",
                show_code: "",
                project_name: "",
                misc_info: "",
                source: "",
                brand: "",
                country: ""
            });
            setPreviewCode("");
        }
    }, [project, isOpen]);

    // Fetch Client Names when opening in 'existing' mode
    useEffect(() => {
        if (isOpen && mode === 'existing' && !project) {
            const fetchClients = async () => {
                try {
                    const res = await api.get("/marketing/clients/names");
                    setClientNames(res.data.map(name => ({ value: name, label: name })));
                } catch (err) {
                    console.error("Failed to fetch client names", err);
                }
            };
            fetchClients();
        }
    }, [isOpen, mode, project]);

    // Fetch Misc Infos when Client Name changes in 'existing' mode
    useEffect(() => {
        if (isOpen && mode === 'existing' && formData.client_name && !project) {
            const fetchInfos = async () => {
                try {
                    const res = await api.get("/marketing/clients/misc-infos", {
                        params: { client_name: formData.client_name }
                    });
                    setMiscInfos(res.data.map(info => ({ value: info, label: info })));
                } catch (err) {
                    console.error("Failed to fetch misc infos", err);
                }
            };
            fetchInfos();
        } else {
            setMiscInfos([]);
        }
    }, [formData.client_name, isOpen, mode, project]);

    const fetchPreview = async () => {
        if (!formData.client_name) return;
        if (project) return;

        try {
            setPreviewError("");
            const res = await api.get("/marketing/preview-client-code", {
                params: {
                    client_name: formData.client_name,
                    region: formData.region,
                    territory: formData.territory,
                    misc_info: formData.misc_info
                }
            });
            setPreviewCode(res.data.client_code);
        } catch (err) {
            console.error("Preview failed", err);
            setPreviewError("Failed to load preview");
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isOpen && !project) fetchPreview();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.client_name, formData.region, formData.territory, formData.misc_info, isOpen, project]);

    // Autofill effect
    useEffect(() => {
        const fetchDetails = async () => {
            if (!formData.client_name || !formData.misc_info || project) return;

            try {
                const res = await api.get("/marketing/client-details", {
                    params: {
                        client_name: formData.client_name,
                        misc_info: formData.misc_info
                    }
                });

                if (res.data && (res.data.region || res.data.territory || res.data.country)) {
                    setFormData(prev => ({
                        ...prev,
                        region: res.data.region || prev.region,
                        territory: res.data.territory || prev.territory,
                        country: res.data.country || prev.country
                    }));
                }
            } catch (err) {
                console.error("Autofill failed", err);
            }
        };

        const timeoutId = setTimeout(() => {
            if (isOpen) fetchDetails();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.client_name, formData.misc_info, isOpen, project]);

    useEffect(() => {
        const validateFields = async () => {
            if (!formData.project_name && !formData.show_code) return;

            try {
                const res = await api.get("/marketing/validate-project", {
                    params: {
                        project_name: formData.project_name,
                        show_code: formData.show_code
                    }
                });
                if (res.data.errors) {
                    const errs = res.data.errors;
                    if (Object.keys(errs).length > 0) {
                        setError(Object.values(errs).join(", "));
                    } else {
                        setError("");
                    }
                }
            } catch (err) {
                console.error("Validation failed", err);
            }
        };

        const timeoutId = setTimeout(() => {
            if (isOpen) validateFields();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.project_name, formData.show_code, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: value };
            // Reset territory if region changes
            if (name === 'region') {
                updates.territory = "";
            }
            return updates;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = {
                ...formData,
                creation_mode: mode === 'existing' ? 'Existing Client' : 'New Client',
                client_code: previewCode // Send the previewed code to backend
            };
            await onSave(payload);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to save project");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Determine Territory Options based on selected Region
    const currentTerritoryOptions = formData.region ? territoryOptions[formData.region] || [] : [];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-panel rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl shadow-primary/10"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-900 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {project ? "Edit Project" : (mode === 'existing' ? "New Project (Existing Client)" : "New Project (New Client)")}
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mode === 'existing' && !project ? (
                                <>
                                    <Select
                                        label="Client Name"
                                        options={clientNames}
                                        value={formData.client_name}
                                        onChange={(e) => handleChange({ target: { name: "client_name", value: e.target.value } })}
                                        required
                                        placeholder="Select Client"
                                    />
                                    <Select
                                        label="Misc Info"
                                        options={miscInfos}
                                        value={formData.misc_info}
                                        onChange={(e) => handleChange({ target: { name: "misc_info", value: e.target.value } })}
                                        required
                                        placeholder="Select Misc Info"
                                        disabled={!formData.client_name}
                                    />
                                </>
                            ) : (
                                <>
                                    <Input label="Client Name" name="client_name" value={formData.client_name} onChange={handleChange} required placeholder="e.g. Acme Corp" />
                                    <Select
                                        label="Misc Info"
                                        options={miscInfoOptions.map(o => ({ value: o, label: o }))}
                                        value={formData.misc_info}
                                        onChange={(e) => handleChange({ target: { name: "misc_info", value: e.target.value } })}
                                        required
                                        placeholder="Select Misc Info"
                                    />
                                </>
                            )}

                            <Select
                                label="Region"
                                options={regionOptions}
                                value={formData.region}
                                onChange={(e) => handleChange({ target: { name: "region", value: e.target.value } })}
                                required
                                placeholder="Select Region"
                            />

                            <Select
                                label="Territory"
                                options={currentTerritoryOptions.map(t => ({ value: t, label: t }))}
                                value={formData.territory}
                                onChange={(e) => handleChange({ target: { name: "territory", value: e.target.value } })}
                                required
                                placeholder="Select Territory"
                                disabled={!formData.region}
                            />

                            <Input label="Currency" name="currency" value={formData.currency} onChange={handleChange} required placeholder="e.g. USD" />
                            <Input label="Show Code" name="show_code" value={formData.show_code} onChange={handleChange} required placeholder="KRPU" />
                            <Input label="Project Name" name="project_name" value={formData.project_name} onChange={handleChange} required placeholder="e.g. Summer Campaign" />

                            <Input label="Country" name="country" value={formData.country} onChange={handleChange} required placeholder="e.g. USA" />
                            <Input label="Source" name="source" value={formData.source} onChange={handleChange} placeholder="EP name" />

                            <Select
                                label="Brand"
                                options={brandOptions.map(b => ({ value: b, label: b }))}
                                value={formData.brand}
                                onChange={(e) => handleChange({ target: { name: "brand", value: e.target.value } })}
                                placeholder="Select Brand"
                            />
                        </div>

                        <motion.div
                            layout
                            className="bg-dark-800/50 p-6 rounded-xl border border-white/5 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-all"></div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">
                                    {project ? "Current Client Code" : "Realtime Client Code Preview"}
                                </label>
                                {!project && (
                                    <button type="button" onClick={fetchPreview} className="text-xs text-primary hover:text-white flex items-center gap-1">
                                        <RefreshCw size={12} /> Refresh
                                    </button>
                                )}
                            </div>

                            <div className="text-3xl font-mono font-bold text-primary tracking-widest neon-text min-h-[40px]">
                                {previewCode || "---"}
                            </div>
                            {previewError && <div className="text-red-400 text-xs mt-1">{previewError}</div>}
                        </motion.div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={loading} className="min-w-[120px]">
                                {loading ? "Saving..." : "Save Project"}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
