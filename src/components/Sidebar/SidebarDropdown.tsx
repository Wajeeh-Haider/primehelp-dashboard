import { Link, useLocation } from 'react-router-dom';

const SidebarDropdown = ({ item }: any) => {
  const location = useLocation(); // Replaces usePathname from Next.js

  return (
    <>
      <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
        {item.map((subItem: any, index: number) => (
          <li key={index}>
            <Link
              to={subItem.route}
              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                location.pathname === subItem.route ? 'text-white' : ''
              }`}
            >
              {subItem.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SidebarDropdown;
