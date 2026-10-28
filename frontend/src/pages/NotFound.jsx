import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="container not-found">
      <b>404</b>
      <h2>Page not found</h2>
      <p>The page you're looking for was moved or never existed.</p>
      <Button to="/">Back to home</Button>
    </div>
  );
}
