import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getUser } from "../utils/auth";
import "../styles/header.css";

export default function Header() {
  const user = getUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e) => {
    const v = e.target.value;
    setValue(v);

    if (v.trim()) {
      setSearchParams({ q: v });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="header">
      <div className="header-center">
        <input
          type="text"
          placeholder="Search by title, author or ISBN..."
          className="header-search"
          value={value}
          onChange={handleSearch}
        />
      </div>

      <div className="header-right">
        {user && (
          <div className="header-user">
            <div className="avatar-text">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <span className="username">{user.username}</span>
          </div>
        )}
      </div>
    </div>
  );
}