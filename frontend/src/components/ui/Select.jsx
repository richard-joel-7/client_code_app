import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export function Select({ label, options, value, onChange, placeholder = "Select option", required }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name: label ? label.toLowerCase() : 'select', value: optionValue } });
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="space-y-2" ref={containerRef}>
            {label && <label className="text-sm font-medium text-gray-300">{label} {required && <span className="text-primary">*</span>}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-white/5 border ${isOpen ? 'border-primary/50 ring-2 ring-primary/20' : 'border-white/10'} rounded-lg px-4 py-2.5 text-left flex justify-between items-center transition-all hover:bg-white/10`}
                >
                    <span className={selectedOption ? "text-white" : "text-gray-500"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-2 bg-[#0A0A0A] border border-white/20 rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10"
                        >
                            <div className="max-h-60 overflow-y-auto py-1">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className="w-full px-4 py-2 text-left hover:bg-white/10 flex justify-between items-center group transition-colors"
                                    >
                                        <span className={option.value === value ? "text-primary font-medium" : "text-gray-300 group-hover:text-white"}>
                                            {option.label}
                                        </span>
                                        {option.value === value && <Check size={16} className="text-primary" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
