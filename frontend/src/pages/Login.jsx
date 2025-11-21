import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Lock, User, ArrowRight } from "lucide-react";

const logo = "/pixoo-black-logo.png";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const role = await login(username, password);
            if (role === "marketing") navigate("/marketing");
            else if (role === "team2") navigate("/team2");
            else if (role === "team3") navigate("/team3");
            else navigate("/");
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-panel rounded-3xl p-8 md:p-12 w-full max-w-md relative"
            >
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 shadow-lg"
                    >
                        <img src={logo} alt="Phantom FX" className="h-12 object-contain" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white text-center tracking-tight">
                        Welcome <span className="text-primary neon-text">Back</span>
                    </h2>
                    <p className="text-gray-400 mt-2 text-center">Enter your credentials to access the portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Username"
                                className="pl-12"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="password"
                                placeholder="Password"
                                className="pl-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                        >
                            {error}
                        </motion.div>
                    )}

                    <Button type="submit" className="w-full py-3.5 text-lg group">
                        Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Protected System • Phantom FX Internal
                </div>
            </motion.div>
        </div>
    );
}
