export function formatDate(timestamp: string): string {
  const date = new Date(JSON.parse(timestamp));
  return (
    date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US")
  );
}
