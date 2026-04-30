import { redirect } from 'next/navigation';

export default function CopywritingPage() {
  redirect('/templates?kind=copywriting');
}
