import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <motion.div 
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    </motion.div>
  )
}