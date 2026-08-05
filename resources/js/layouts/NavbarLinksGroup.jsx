import useNavigationStore from '@/hooks/store/useNavigationStore';
import { redirectToUrl } from '@/utils/route';
import { Box, Collapse, Group, UnstyledButton } from '@mantine/core';
import classes from './css/NavbarLinksGroup.module.css';
import AppIcon from '@/components/AppIcon';

export default function NavbarLinksGroup({
  item,
  closeDrawer = () => {},
}) {
  const { toggle, active } = useNavigationStore();
  const hasLinks = Array.isArray(item.links);

  const itemClick = () => {
    if (hasLinks) {
      toggle(item.label);
    } else {
      active(item.label, false);
      closeDrawer();          // <-- cerrar menú en mobile
      redirectToUrl(item.link);
    }
  };

  const subItemClick = subItem => {
    active(subItem.label, true);
    closeDrawer();            // <-- cerrar menú en mobile
    redirectToUrl(subItem.link);
  };

  return (
    <>
      <UnstyledButton
        onClick={itemClick}
        className={`${classes.control} ${item.active ? classes.active : ''}`}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <AppIcon
              name={item.icon}
              filled={item.active}
              size={22}
            />

            <Box ml="md">{item.label}</Box>
          </Box>

          {hasLinks && (
            <AppIcon
              name="chevron_right"
              size={18}
              style={{
                transform: item.opened ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform .2s ease',
              }}
            />
          )}
        </Group>
      </UnstyledButton>

      {hasLinks && (
        <Collapse in={item.opened}>
          {item.links
            .filter(l => l.visible)
            .map(subItem => (
              <UnstyledButton
                key={subItem.label}
                className={`${classes.link} ${subItem.active ? classes.active : ''}`}
                onClick={() => subItemClick(subItem)}
              >
                {subItem.label}
              </UnstyledButton>
            ))}
        </Collapse>
      )}
    </>
  );
}