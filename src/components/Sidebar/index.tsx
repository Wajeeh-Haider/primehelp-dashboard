import { Link } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import ClickOutside from '../ClickOutside';
import useLocalStorage from '../../hooks/useLocalStorage';
import {
  TbDashboard,
  TbBook,
  TbUsers,
  // TbSettings,
  // TbReportAnalytics,
} from 'react-icons/tb';

import { FcFeedback } from 'react-icons/fc';
import { MdAdminPanelSettings, MdPayment } from 'react-icons/md';
import { FaServicestack } from 'react-icons/fa6';
import { TbSettings } from 'react-icons/tb';
import { FaQuestionCircle } from 'react-icons/fa';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const menuGroups = [
  {
    name: 'Main',
    menuItems: [
      {
        icon: <TbDashboard size={18} />,
        label: 'Dashboard',
        route: '/',
      },
      // {
      //   icon: <TbBook size={18} />,
      //   label: "Service Types",
      //   route: "/service-types",
      // },
      {
        icon: <FaServicestack size={18} />,
        label: 'Services',
        route: '/services',
      },
      {
        icon: <TbBook size={18} />,
        label: 'Bookings',
        route: '/bookings',
      },
      {
        icon: <TbUsers size={18} />,
        label: 'Users',
        route: '/users',
      },

      // {
      //   icon: <TbReportAnalytics size={18} />,
      //   label: "Users Report",
      //   route: "/user-reports",
      // },
    ],
  },
  {
    name: 'Manage',
    menuItems: [
      {
        icon: <TbSettings size={18} />,
        label: 'App Settings',
        route: '/app-settings',
      },
      {
        icon: <TbBook size={18} />,
        label: 'Service Categories',
        route: '/service-categories',
      },
      {
        icon: <MdAdminPanelSettings size={18} />,
        label: 'Admin',
        route: '/admin',
      },
      {
        icon: <FaQuestionCircle size={18} />,
        label: 'FAQ Management',
        route: '/faq-management',
      },
      {
        icon: <FcFeedback size={18} />,
        label: 'Feedbacks',
        route: '/feedback',
      },
      {
        icon: <MdPayment size={18} color="white" />,
        label: 'Payments',
        route: '/payments',
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [pageName, setPageName] = useLocalStorage('selectedMenu', 'dashboard');

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-[#01525B] duration-300 ease-linear dark:bg-boxdark xl:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 xl:py-6.5">
          <Link to="/">
            {/* <img
              width={100}
              height={50}
              src={'/images/logo/appLogo.png'}
              alt="Logo"
            /> */}
            <h1 className="text-2xl font-bold text-white">Prime Help</h1>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block xl:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-5 px-4 py-4 xl:mt-9 xl:px-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-white">
                  {group.name}
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
