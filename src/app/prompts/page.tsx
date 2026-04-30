import { redirect } from 'next/navigation';

export default function PromptsPage() {
  redirect('/templates?kind=prompt');
}
