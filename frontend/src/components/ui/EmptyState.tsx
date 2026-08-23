import React from 'react';
import { PackageX, FolderOpen, Users, BarChart2 } from 'lucide-react';

type EmptyIcon = 'package' | 'folder' | 'users' | 'chart';

const icons: Record<EmptyIcon, React.ReactNode> = {
  package: <PackageX className="w-12 h-12" />,
  folder: <FolderOpen className="w-12 h-12" />,
  users: <Users className="w-12 h-12" />,
  chart: <BarChart2 className="w-12 h-12" />,
};

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: EmptyIcon;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'package',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-gray-300 mb-4">{icons[icon]}</div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
