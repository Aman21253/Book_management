import { getUser } from "../utils/auth";
import "../styles/header.css";

export default function Header() {
  const user = getUser();

  return (
    <div className="header">
      {/* LEFT */}
      <div className="header-left">
        <h2>Book Management System</h2>
      </div>

      {/* CENTER */}
      <div className="header-center">
        <input
          type="text"
          placeholder="Search..."
          className="header-search"
        />
      </div>

      {/* RIGHT */}
      <div className="header-right">
        {user && (
          <div className="header-user">
            {user.image ? (
              <img
                src={user.image}
                alt="profile"
                className="avatar-img"
              />
            ) : (
              <div className="avatar-text">
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="username">{user.username}</span>
          </div>
        )}
      </div>
    </div>
  );
}