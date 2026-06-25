export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="admin-empty">
      <p>{message}</p>
    </div>
  );
}