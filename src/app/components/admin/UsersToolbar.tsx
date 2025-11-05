// app/components/admin/UsersToolbar.tsx
import { Search, UserPlus, ChevronDown } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

type Props = {
  onNewUser: () => void;
  onSearch: (query: string) => void;
  onFilterRole: (role: string) => void;
  currentRole: string;
};

const roles = ["All Roles", "Admin", "Employee", "Customer"];

export default function UsersToolbar({
  onNewUser,
  onSearch,
  onFilterRole,
  currentRole,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative min-w-[250px] sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-white py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-gray-50">
            {currentRole}
            <ChevronDown
              className="-mr-1 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {roles.map((role) => (
                  <Menu.Item key={role}>
                    {({ active }) => (
                      <button
                        onClick={() => onFilterRole(role)}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } ${
                          currentRole === role
                            ? "font-bold text-primary"
                            : "text-gray-700"
                        } block w-full text-left px-4 py-2 text-sm`}
                      >
                        {role}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <button
        onClick={onNewUser}
        className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:brightness-110"
      >
        <UserPlus className="h-4 w-4" /> Add Employee
      </button>
    </div>
  );
}
