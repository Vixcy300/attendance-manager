import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-4 md:p-6 lg:p-8 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
