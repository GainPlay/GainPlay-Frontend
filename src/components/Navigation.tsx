import { Link, useLocation } from "react-router-dom"
import { Home, ShoppingCart, User, Search } from "lucide-react"

const navItems = [
  { icon: Home, path: "/home" },
  { icon: ShoppingCart, path: "/cart" },
  { icon: User, path: "/profile" },
  { icon: Search, path: "/friends" },
]

export default function Navigation() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-200 z-10">
      <ul className="flex justify-around p-2 max-w-md mx-auto">
        {navItems.map(({ icon: Icon, path }) => (
          <li key={path}>
            <Link to={path}>
              <Icon className={`h-6 w-6 ${pathname === path ? "text-purple-600" : "text-purple-400"}`} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

