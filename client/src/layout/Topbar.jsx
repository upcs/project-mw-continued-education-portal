import { Search, Bell, Settings } from "lucide-react";
import "../css/topbar.css";

export default function Topbar() {
  return (
    
    <header className="topbar">
      <h1 className="title" >UPLENDO LEARNING PLATFORM</h1>  
      <div className="topbar__search">
        <input
          className="topbar__input"
          placeholder="search"
        />
        <Search className="topbar__search-icon" size={18} />
      </div>

      <div className="topbar__actions">
        <button className="topbar__icon-btn">
          <Bell size={20} />
          <span className="topbar__notif-dot" />
        </button>

        <button className="topbar__icon-btn">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}