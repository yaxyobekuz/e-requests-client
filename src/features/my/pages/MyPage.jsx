// Components
import List from "@/shared/components/ui/List";
import BottomNavbar from "@/shared/components/ui/BottomNavbar";

// Icons
import { ChevronRight, FileText, Settings, Wrench } from "lucide-react";

const linkItems = [
  {
    title: "Murojaatlarim",
    description: "Barcha murojaatlar holati",
    to: "/requests",
    icon: FileText,
    iconBg: "from-blue-400 to-blue-700",
  },
  {
    title: "Arizalarim",
    description: "Barcha xizmatlar holati",
    to: "/services",
    icon: Settings,
    iconBg: "from-green-400 to-green-700",
  },
  {
    title: "Buyurtmalarim",
    description: "Barcha buyurtmalar holati",
    to: "/msk",
    icon: Wrench,
    iconBg: "from-yellow-400 to-yellow-700",
  },
];

const MyPage = () => {
  return (
    <div className="min-h-screen pt-5 pb-20 animate__animated animate__fadeIn">
      <div className="space-y-5 container">
        {/* Top */}
        <h1 className="text-blue-500 font-bold text-xl">Arizalarim</h1>

        <List
          items={linkItems.map((item) => ({
            title: item.title,
            description: item.description,
            icon: item.icon,
            gradientFrom: item.iconBg.split(" ")[0],
            gradientTo: item.iconBg.split(" ")[1],
            to: item.to,
            trailing: <ChevronRight strokeWidth={1.5} />,
          }))}
        />
      </div>

      <BottomNavbar />
    </div>
  );
};

export default MyPage;
