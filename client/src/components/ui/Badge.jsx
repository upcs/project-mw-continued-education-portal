export default function Badge({ children, type = "default" }) {
  return <span className={`badge badge--${type}`}>{children}</span>;
}