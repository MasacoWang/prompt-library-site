import LibraryPage from '@/components/LibraryPage';

export default function PhasesPage() {
  return (
    <LibraryPage
      kindFilter={null}
      pageTitle="Recruiting Phases"
      pageDescription="Browse templates and prompts organized by recruiting pipeline phase."
      filterMode="phase"
    />
  );
}
