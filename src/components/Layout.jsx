import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-3 sm:p-4 md:p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
