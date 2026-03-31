"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getIqaChecks } from "@/lib/iqa-data";

interface NavChild {
  name: string;
  href: string;
  badge?: number;
}

interface NavSection {
  name: string;
  icon: React.ReactNode;
  children: NavChild[];
  alwaysOpen?: boolean;
}

const IconStaff = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'
    />
  </svg>
);

const IconLocation = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z'
    />
  </svg>
);

const IconLearning = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342m-7.482 0c-.483.149-.961.31-1.432.476'
    />
  </svg>
);

const IconAssessment = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z'
    />
  </svg>
);

const IconNetwork = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418'
    />
  </svg>
);

const IconShop = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z'
    />
  </svg>
);

const IconContent = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'
    />
  </svg>
);

const IconFinance = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z'
    />
  </svg>
);

const IconIqa = () => (
  <svg
    width='16'
    height='16'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={1.8}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z'
    />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width='14'
    height='14'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}
    className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='m8.25 4.5 7.5 7.5-7.5 7.5'
    />
  </svg>
);

const sections: NavSection[] = [
  // No pages yet
  // {
  //   name: 'Staff Management',
  //   icon: <IconStaff />,
  //   children: [
  //     { name: 'Staff', href: '/iam/staff' },
  //     { name: 'Teams', href: '/iam/teams' },
  //     { name: 'Exceptions', href: '/iam/exceptions' },
  //   ],
  // },
  // No pages yet
  // {
  //   name: 'Locations',
  //   icon: <IconLocation />,
  //   children: [
  //     { name: 'Management', href: '/locations/management' },
  //     { name: 'Rooms', href: '/locations/rooms' },
  //     { name: 'Exceptions', href: '/locations/exceptions' },
  //     { name: 'Countries', href: '/locations/countries' },
  //   ],
  // },

  {
    name: "Finance",
    icon: <IconFinance />,
    children: [{ name: "Packages", href: "/finance/packages" }],
  },
  {
    name: "Assessment Center",
    icon: <IconAssessment />,
    alwaysOpen: true,
    children: [
      // { name: 'Overview', href: '/assessment-center' },
      // { name: 'Assessments', href: '/assessment-center/assessments' },
      // { name: 'Grading Queue', href: '/assessment-center/grading', badge: 17 },
      // { name: 'RPL Requests', href: '/assessment-center/rpl-requests', badge: 3 },
      { name: "Assessor Queue", href: "/assessment-center/assessor-queue" },
      { name: "Attendance", href: "/assessment-center/attendance" },
      // { name: 'Reports', href: '/assessment-center/reports' },
    ],
  },
  {
    name: "IQA",
    icon: <IconIqa />,
    children: [
      { name: "Audit", href: "/iqa/review-queue" },
      { name: "Cohort View", href: "/iqa/sampling" },
      { name: "Assessment Status", href: "/iqa/assign" },
      { name: "People & Roles", href: "/iqa/people" },
      { name: "Categories", href: "/iqa/categories" },
    ],
  },
  // No pages yet
  // {
  //   name: 'Access Network',
  //   icon: <IconNetwork />,
  //   children: [
  //     { name: 'Offers', href: '/access-network/offers' },
  //     { name: 'Categories', href: '/access-network/categories' },
  //     { name: 'Partners', href: '/access-network/partners' },
  //   ],
  // },
  // No pages yet
  // {
  //   name: 'Shop',
  //   icon: <IconShop />,
  //   children: [
  //     { name: 'Collections', href: '/academic-resources/categories' },
  //     { name: 'Course Books', href: '/other/course-books' },
  //   ],
  // },
  // No pages yet
  // {
  //   name: 'Content',
  //   icon: <IconContent />,
  //   children: [
  //     { name: 'Pages', href: '/content/pages' },
  //   ],
  // },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isInAssessmentCenter = pathname.startsWith("/assessment-center");

  const isInIqa = pathname.startsWith("/iqa");
  const isInLearning = pathname.startsWith("/admin");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Assessment Center": true,
    IQA: true,
  });

  const [iqaPendingCount, setIqaPendingCount] = useState(0);

  useEffect(() => {
    const update = () =>
      setIqaPendingCount(
        getIqaChecks().filter((c) => c.status === "Pending").length,
      );
    update();
    window.addEventListener("iqa-checks-updated", update);
    return () => window.removeEventListener("iqa-checks-updated", update);
  }, [pathname]);

  useEffect(() => {
    if (isInIqa) setOpenSections((prev) => ({ ...prev, IQA: true }));
    if (isInLearning) setOpenSections((prev) => ({ ...prev, Learning: true }));
  }, [isInIqa, isInLearning]);

  const toggle = (name: string) => {
    if (name === "Assessment Center") return;
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className='flex flex-col w-64 min-h-screen bg-slate-900 text-slate-300 shrink-0'>
      {/* Logo */}
      <div className='flex items-center gap-3 px-5 py-5 border-b border-slate-700/60'>
        <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='white'
          >
            <path
              d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
              stroke='white'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
          </svg>
        </div>
        <div>
          <p className='text-white font-semibold text-sm leading-tight'>
            LMS Admin
          </p>
          <p className='text-slate-500 text-xs'>Trades Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className='flex-1 overflow-y-auto py-3 px-3'>
        {sections.map((section) => {
          const isAssessment = section.name === "Assessment Center";
          const isOpen = isAssessment ? true : !!openSections[section.name];
          const hasActiveChild =
            section.children.some(
              (c) =>
                c.href === pathname ||
                (c.href !== "/assessment-center" &&
                  c.href !== "/iqa" &&
                  pathname.startsWith(c.href)),
            ) ||
            (section.name === "IQA" && isInIqa);

          return (
            <div
              key={section.name}
              className='mb-1'
            >
              <button
                onClick={() => toggle(section.name)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    isAssessment
                      ? "text-orange-400 bg-slate-800/80 cursor-default"
                      : hasActiveChild
                        ? "text-white bg-slate-800"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }
                `}
              >
                <span className={isAssessment ? "text-orange-400" : ""}>
                  {section.icon}
                </span>
                <span className='flex-1 text-left'>{section.name}</span>
                {!isAssessment && <IconChevron open={isOpen} />}
              </button>

              {isOpen && (
                <div className='mt-0.5 ml-3 pl-3 border-l border-slate-700/50 space-y-0.5'>
                  {section.children.map((child) => {
                    const isActive =
                      child.href === "/assessment-center"
                        ? pathname === "/assessment-center"
                        : child.href === "/iqa"
                          ? pathname === "/iqa"
                          : pathname === child.href ||
                            pathname.startsWith(child.href + "/");

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`
                          flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors
                          ${
                            isActive
                              ? "text-orange-400 bg-orange-500/10 font-medium"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                          }
                        `}
                      >
                        <span>{child.name}</span>
                        {(child.href === "/iqa/review-queue"
                          ? iqaPendingCount
                          : (child.badge ?? 0)) > 0 && (
                          <span
                            className={`
                            text-xs font-semibold px-1.5 py-0.5 rounded-full
                            ${isActive ? "bg-orange-500/20 text-orange-400" : "bg-slate-700 text-slate-300"}
                          `}
                          >
                            {child.href === "/iqa/review-queue"
                              ? iqaPendingCount
                              : child.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div className='px-4 py-4 border-t border-slate-700/60'>
        <div className='min-w-0'>
          <p className='text-white text-sm font-medium truncate'>Admin User</p>
          <p className='text-slate-500 text-xs truncate'>admin@lms.co.uk</p>
        </div>
      </div>
    </aside>
  );
}
