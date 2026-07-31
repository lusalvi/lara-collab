import { usePage } from '@inertiajs/react';
import upperFirst from 'lodash/upperFirst';

export default function useRoles() {
  const { shared, auth } = usePage().props;
  const roles = shared.roles;
  const roleColors = {};

  const colors = [
    'grape', 'yellow', 'indigo', 'lime',
    'cyan', 'violet', 'orange', 'pink',
  ];

  roles.forEach((role, index) => roleColors[role.name] = colors[index % colors.length]);

  const getColor = (role) => roleColors[role];

  const getDropdownValues = ({ except = [] } = {}) => {
    const autoExclude = auth.user.is_super_admin
      ? []
      : ['superadmin', 'admin'];

    return roles
      .filter(i => !except.includes(i.name) && !autoExclude.includes(i.name))
      .map(role => ({ value: role.name, label: upperFirst(role.name) }));
  };

  return { getColor, getDropdownValues };
}
