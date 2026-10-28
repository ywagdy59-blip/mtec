export default function Spinner({ size = "md", label = "Loading" }) {
  return <span className={`spinner spinner-${size}`} role="status" aria-label={label} />;
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
    </div>
  );
}
