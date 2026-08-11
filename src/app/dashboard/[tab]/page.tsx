import DashboardView, { TabType } from '../DashboardView';

export function generateStaticParams() {
  return [
    { tab: 'list' },
    { tab: 'add' },
    { tab: 'categories' },
    { tab: 'menu' },
    { tab: 'comments' },
    { tab: 'subscribers' },
    { tab: 'settings' },
  ];
}

interface TabPageProps {
  params: Promise<{ tab: string }>;
}

export default async function TabPage({ params }: TabPageProps) {
  const resolvedParams = await params;
  const tab = (resolvedParams.tab || 'dashboard') as TabType;
  return <DashboardView initialTab={tab} />;
}
