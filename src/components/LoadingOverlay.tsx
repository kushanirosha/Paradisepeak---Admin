import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LoadingOverlay: React.FC = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (<div className="fixed inset-0 bg-sky-900/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <motion.div
            initial={{ y: -30 }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
        > <img
                src="/src/assets/logo.png"
                alt="Diver Loading"
                className="w-32 h-32 mx-auto mb-4"
            /> <p className="text-white text-lg font-medium">
                Travel into your dashboard... </p>
        </motion.div> </div>
    );
};

export default LoadingOverlay;
