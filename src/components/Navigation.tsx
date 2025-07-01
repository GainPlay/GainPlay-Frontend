import { Link, useLocation } from "react-router-dom"
import { Home, ShoppingCart, User, Search } from "lucide-react"
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, path: "/home" },
  { icon: ShoppingCart, path: "/cart" },
  { icon: User, path: "/profile" },
  { icon: Search, path: "/friends" },
]

export default function Navigation() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="backdrop-blur-md bg-white/80 border border-white/30 rounded-3xl shadow-2xl px-2 py-3">
        <ul className="flex justify-around items-center">
          {navItems.map(({ icon: Icon, path }) => {
            const isActive = pathname === path;
            return (
              <li key={path} className="relative">
                <Link to={path} className="block">
                  <motion.div
                    className={`relative p-3 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg"
                        : "hover:bg-white/50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-200 ${
                        isActive ? "text-white" : "text-purple-600"
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}