import { Search } from "lucide-react";

export default function DiscussSearch() {
  return (
    <div className="discuss-search">
      <div className="discuss-search__box">
        <Search className="discuss-search__icon" size={28} />
        <input
          className="discuss-search__input"
          type="text"
          placeholder="search discussion"
        />
      </div>

      <div className="discuss-search__line" />

      <button className="discuss-search__btn">+ Ask New</button>
    </div>
  );
}