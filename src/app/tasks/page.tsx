import TasksSurface from '@/components/global/TasksSurface';
import LocalizedPageShell from '@/components/global/LocalizedPageShell';

export default function Tasks() {
  return (
    <LocalizedPageShell
      titleKey="space_home.tasks"
      titleFallback="Tâches"
      descriptionKey="page.tasks.description"
      descriptionFallback="File de travail agrégée fournie par les propriétaires admis"
    >
      <TasksSurface />
    </LocalizedPageShell>
  );
}
