import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../css/layout.css";

export default function AppLayout() {
  return (
    <div className="app">
      <Sidebar />

      <div className="app__content">
        <Topbar />
        <main className="app__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
