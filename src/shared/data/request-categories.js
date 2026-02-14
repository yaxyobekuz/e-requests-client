// Icons
import { Banknote, Building2, Users } from "lucide-react";

export const requestCategories = [
  {
    id: "infrastructure",
    label: "Infratuzilma",
    description: "Yo'l, ko'prik, binolar va boshqa infratuzilma muammolari",
    gradientFrom: "from-yellow-400",
    gradientTo: "to-yellow-700",
    icon: Building2,
  },
  {
    id: "social",
    label: "Ijtimoiy",
    description: "Ijtimoiy yordam, ta'lim, sog'liqni saqlash va boshqalar",
    gradientFrom: "from-sky-400",
    gradientTo: "to-sky-700",
    icon: Users,
  },
  {
    id: "finance",
    label: "Moliya",
    description: "Moliyaviy yordam, subsidiyalar va to'lovlar",
    gradientFrom: "from-teal-400",
    gradientTo: "to-teal-700",
    icon: Banknote,
  },
];
