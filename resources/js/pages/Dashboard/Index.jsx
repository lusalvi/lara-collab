import Layout from "@/layouts/MainLayout";
import { usePage } from "@inertiajs/react";
import { SimpleGrid, Title } from "@mantine/core";
import { useState } from "react";
import OverdueTasks from "./Cards/OverdueTasks";
import { ProjectCard } from "./Cards/ProjectCard";
import RecentComments from "./Cards/RecentComments";
import RecentlyAssignedTasks from "./Cards/RecentlyAssignedTasks";
import StatsBar from "./Cards/StatsBar";

const Dashboard = () => {
  const { projects, overdueTasks, recentlyAssignedTasks, recentComments } = usePage().props;
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  return (
    <>
      <Title mb="xl">Dashboard</Title>

      <StatsBar
        overdueCount={overdueTasks.length}
        assignedCount={recentlyAssignedTasks.length}
        commentsCount={recentComments.length}
        projectsCount={projects.length}
        activeSection={activeSection}
        onToggleSection={toggleSection}
      />

      {activeSection === "overdue" && <OverdueTasks tasks={overdueTasks} />}
      {activeSection === "assigned" && <RecentlyAssignedTasks tasks={recentlyAssignedTasks} />}
      {activeSection === "comments" && <RecentComments comments={recentComments} />}

      {activeSection && <div style={{ marginBottom: "var(--mantine-spacing-xl)" }} />}

      {projects.length > 0 && (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="md"
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SimpleGrid>
      )}
    </>
  );
};

Dashboard.layout = (page) => <Layout title="Dashboard">{page}</Layout>;

export default Dashboard;