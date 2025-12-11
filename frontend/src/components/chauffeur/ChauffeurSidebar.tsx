import { Link, useLocation } from "react-router-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  { path: "/chauffeur/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/chauffeur/trajets", icon: "🗺️", label: "Mes Trajets" },
];

export default function ChauffeurSidebar({ isOpen, onClose }: Props) {
  const location = useLocation();

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚚</span>
            <span className="text-lg font-bold text-gray-900">Fleet Manager</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 lg:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
