import { reloadWithQuery, reloadWithoutQueryParams } from '@/utils/route';
import { Tabs } from '@mantine/core';
import classes from './css/ArchivedTabs.module.css';

export default function ArchivedTabs({
  activeLabel = 'Activos',
  archivedLabel = 'Archivados',
}) {
  const isArchived = !!route().params.archived;
  const activeTab = isArchived ? 'archived' : 'active';

  const handleChange = (value) => {
    if (value === activeTab) return;

    if (value === 'archived') {
      reloadWithQuery({ archived: 1 });
    } else {
      reloadWithoutQueryParams({ exclude: ['archived'] });
    }
  };

  return (
    <Tabs
      value={activeTab}
      onChange={handleChange}
      classNames={{ root: classes.root, list: classes.list, tab: classes.tab }}
    >
      <Tabs.List>
        <Tabs.Tab value='active'>{activeLabel}</Tabs.Tab>
        <Tabs.Tab
          value='archived'
          color='red'
        >
          {archivedLabel}
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
