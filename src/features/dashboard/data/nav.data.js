// Icons
import { FileText, Settings, Wrench, Sprout } from "lucide-react";

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
  {
    to: "/tomorqa",
    label: "Mening tomorqam",
    description: "Hosil ma'lumotlarini kiriting",
    icon: Sprout,
    gradientFrom: "from-lime-400",
    gradientTo: "to-green-700",
  },
];

export default navItems;
