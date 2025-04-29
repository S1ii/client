import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Temporary mock AdminLayout component
 * This is just a placeholder to resolve TypeScript errors
 * Will need to be replaced with a real implementation
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="admin-layout">
      <div className="admin-layout-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 