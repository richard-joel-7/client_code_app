import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { X, Sparkles, RefreshCw } from "lucide-react";
import api from "../lib/api";

export default function ProjectModal({ isOpen, onClose, project, onSave }) {
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to save project");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-panel rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl shadow-primary/10"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 backdrop-blur-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {project ? "Edit Project" : "Create New Project"}
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Client Name" name="client_name" value={formData.client_name} onChange={handleChange} required placeholder="e.g. Acme Corp" />

                            <Select
                                label="Region"
                                options={[
                                    { value: "Global", label: "Global" },
                                    { value: "India", label: "India" }
                                ]}
                                value={formData.region}
                                onChange={(e) => handleChange({ target: { name: "region", value: e.target.value } })}
                                required
                            />

                            <Input label="Territory" name="territory" value={formData.territory} onChange={handleChange} required placeholder="Chennai" />
                            <Input label="Currency" name="currency" value={formData.currency} onChange={handleChange} required placeholder="e.g. USD" />
                            <Input label="Show Code" name="show_code" value={formData.show_code} onChange={handleChange} required placeholder="KRPU" />
                            <Input label="Project Name" name="project_name" value={formData.project_name} onChange={handleChange} required placeholder="e.g. Summer Campaign" />
                            <Input label="Misc Info" name="misc_info" value={formData.misc_info} onChange={handleChange} required placeholder="Individual" />
                            <Input label="Country" name="country" value={formData.country} onChange={handleChange} required placeholder="e.g. USA" />
                            <Input label="Source" name="source" value={formData.source} onChange={handleChange} placeholder="EP name" />
                            <Input label="Brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="PFX" />
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
