
"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Book,
  GraduationCap,
  Video,
  Trophy,
  FileText,
  Link2,
  ChevronDown,
  Plane,
} from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import { MdOutlineLeaderboard } from "react-icons/md";


const links = [
  { name: "Dashboard", href: "/dashboard", icon: Trophy },

  {
    name: "Questions",
    icon: GraduationCap,
    basePath: "/dashboard/question",
    subLinks: [
      { name: "Create Question", href: "/dashboard/question/create-question" },
      { name: "View All Question", href: "/dashboard/question/view-question" },
    ],
  },

  {
    name: "Exam",
    icon: GraduationCap,
    basePath: "/dashboard/exam",
    subLinks: [
      { name: "Create Exam", href: "/dashboard/exam/create-exam" },
      { name: "View All Exam", href: "/dashboard/exam/view-exam" },
    ],
  },

  {
    name: "Our Team",
    icon: Video,
    basePath: "/dashboard/team",
    subLinks: [
      // STUDENT


      // ADMIN
      { name: "Create Admin", href: "/dashboard/team/create-admin" },
      { name: "View Admin", href: "/dashboard/team/view-admin" },
    ],
  },

  // { name: "Leaderboard", href: "/dashboard/result", icon: Trophy },

    {
    name: "Leaderboard",
    icon: MdOutlineLeaderboard,
    basePath: "/dashboard/result",
    subLinks: [
    
      { name: "View All Result", href: "/dashboard/result/view-result" },
    ],
  },

  {
    name: "Guideline",
    icon: Book,
    basePath: "/dashboard/guideline",
    subLinks: [
      { name: "Create Guideline", href: "/dashboard/guideline/add-guideline" },
      { name: "View All Guideline", href: "/dashboard/guideline/view-guideline" },
    ],
  },

  {
    name: "Youtube",
    icon: Video,
    basePath: "/dashboard/youtube",
    subLinks: [
      { name: "Create Video", href: "/dashboard/youtube/create-video" },
      { name: "View All Videos", href: "/dashboard/youtube/view-video" },
    ],
  },

  {
    name: "My Book",
    icon: Book,
    basePath: "/dashboard/my-book",
    subLinks: [
      { name: "Create Book", href: "/dashboard/my-book/create-book" },
      { name: "View Books", href: "/dashboard/my-book/view-book" },
    ],
  },
  {
    name: "Sturdy Plan",
    icon: Plane,
    basePath: "/dashboard/sturdy-plan",
    subLinks: [
      { name: "Create Plan", href: "/dashboard/sturdy-plan/create-plan" },
      { name: "View Plans", href: "/dashboard/sturdy-plan/view-plan" },
    ],
  },

  { name: "Profile", href: "/dashboard/profile", icon: Link2 },
];





export const Sidebar = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(() => {
    // Page load-e active dropdown khola rakhar jonno
    for (const link of links) {
      if (link.basePath && pathname.startsWith(link.basePath)) {
        return link.name;
      }
    }
    return "";
  });

  return (
    <aside className="w-64 bg-[#2B6A5B] border-r border-green-700/30 hidden md:flex flex-col shadow-lg">
      

   <Link href="/dashboard">
      <div className="p-4 border-b border-green-700/50">
        {/* White background card for logo */}
        <div className="bg-white rounded-lg shadow-lg w-[150px] flex items-center justify-center py-2 
        ">
          <Image 
            src="/logo.png"
            width={120} 
            height={40} 
            alt="BCS Exam Hub"
            priority={true} // Ensures logo loads fast
          />
        </div>
      </div>
 
   </Link>

      <nav className="flex-1 p-4 space-y-2 text-green-100">
        {links.map((link) => {
          const Icon = link.icon;

          if (link.subLinks) {
            const isOpen = openDropdown === link.name;
            const isActive = pathname.startsWith(link.basePath);

            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdown(isOpen ? "" : link.name)}
                  className={clsx(
                    "flex items-center justify-between w-full gap-3 p-3 rounded-lg transition hover:bg-green-700 hover:text-white",
                    isActive && "font-semibold text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </div>
                  <ChevronDown
                    className={clsx(
                      "w-5 h-5 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="py-2 pl-4 mt-1 ml-4 space-y-1 border-l-2 border-emerald-400 bg-green-800/30 rounded-r-md">
                    {link.subLinks.map((subLink) => (
                      <Link
                        key={subLink.href}
                        href={subLink.href}
                        className={clsx(
                          "block p-2 rounded-md transition hover:bg-green-700 hover:text-white text-sm",
                          pathname === subLink.href &&
                            "font-bold text-white"
                        )}
                      >
                        {subLink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-lg transition hover:bg-green-700 hover:text-white",
                active && "bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-md"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

