import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bz-app">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="bz-main">
        {/* Pages render Topbar themselves so they control title/actions */}
        {typeof children === 'function' ? children(setSidebarOpen) : children}
      </div>
    </div>
  );
}
