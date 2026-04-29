import LibraryPage from '@/components/LibraryPage';

export default function ScenariosPage() {
  return (
    <LibraryPage
      kindFilter={null}
      pageTitle="Scenarios"
      pageDescription="Browse templates and prompts organized by recruiting scenario."
      filterMode="scenario"
    />
  );
}
