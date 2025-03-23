import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { IWithChildrenProps } from '../../types';

interface IDashboardLayoutProps extends IWithChildrenProps {
  // Propiedades adicionales específicas del layout si son necesarias
}

const DashboardLayout: React.FC<IDashboardLayoutProps> = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Función para alternar el estado de la barra lateral
  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header component */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {/* Sidebar component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Footer component */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;
