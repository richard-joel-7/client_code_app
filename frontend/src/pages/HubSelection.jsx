import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, BarChart3, ArrowRight } from "lucide-react";

export default function HubSelection() {
    const navigate = useNavigate();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-4xl w-full relative z-10"
            >
                <motion.div variants={item} className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Welcome, <span className="text-primary">CEO</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Select a hub to continue to your dashboard</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Marketing Hub Card */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/marketing")}
                        className="glass-panel p-8 rounded-3xl border border-white/10 cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary/20"></div>

                        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                            <Sparkles size={28} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">Marketing Hub</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Manage client codes, track project creation, and oversee marketing operations.
                        </p>

                        <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform">
                            Enter Hub <ArrowRight size={18} className="ml-2" />
                        </div>
                    </motion.div>

                    {/* Business Hub Card */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/business")}
                        className="glass-panel p-8 rounded-3xl border border-white/10 cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20"></div>

                        <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                            <BarChart3 size={28} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">Business Hub</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Analyze revenue, track win rates, and view high-level business performance metrics.
                        </p>

                        <div className="flex items-center text-purple-400 font-medium group-hover:translate-x-2 transition-transform">
                            Enter Hub <ArrowRight size={18} className="ml-2" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
