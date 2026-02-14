// Icons
import { FileText, Settings, Wrench } from "lucide-react";

const navItems = [
  {
    to: "/requests",
    label: "Murojaatlar",
    description: "Ariza va murojaatlaringizni yuborin",
    icon: FileText,
    gradientFrom: "from-blue-400",
    gradientTo: "to-blue-700",
  },
  {
    to: "/services",
    label: "Xizmatlar",
    description: "Kundalik xizmatlar holati",
    icon: Settings,
    gradientFrom: "from-emerald-400",
    gradientTo: "to-green-700",
  },
  {
    to: "/msk",
    label: "MSK",
    description: "Mahalla servis kompaniyasi",
    icon: Wrench,
    gradientFrom: "from-orange-400",
    gradientTo: "to-amber-700",
  },
];

export default navItems;
