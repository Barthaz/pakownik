import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { pl } from '@/models/pl';
import { AppNameLogo } from '@/views/layout/AppNameLogo';

const links = [
  { to: '/app', icon: faList, label: pl.lists.title },
  { to: '/app/family', icon: faUsers, label: pl.family.title },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex justify-around py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 text-xs transition-colors ${
                isActive ? 'text-coral' : 'text-muted'
              }`
            }
          >
            <FontAwesomeIcon icon={link.icon} className="text-lg" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-52 md:flex-col md:gap-1 md:pr-6">
      <div className="mb-4">
        <AppNameLogo className="h-8 w-auto" />
      </div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/app'}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-coral/15 text-coral-dark'
                : 'text-muted hover:bg-border/50 hover:text-navy'
            }`
          }
        >
          <FontAwesomeIcon icon={link.icon} />
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
