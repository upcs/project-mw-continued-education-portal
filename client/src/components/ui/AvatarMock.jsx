export function Avatar({ children, className = "" }) {
  return <div className={`avatar ${className}`}>{children}</div>;
}

export function AvatarImage({ src, alt = "" }) {
  return <img className="avatar__image" src={src} alt={alt} />;
}

export function AvatarFallback({ children }) {
  return <span className="avatar__fallback">{children}</span>;
}