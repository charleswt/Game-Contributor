export function formatDate(timestamp: string): string {
  const date = new Date(JSON.parse(timestamp));
  return (
    date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US")
  );
}
// 
export function timeSince(timeStamp: Date): string {
  const now = new Date();
  const secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;

  if (secondsPast < 60) {
    return `${Math.floor(secondsPast)}s`;
  }

  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)}m`;
  }

  if (secondsPast <= 86400) {
    return `${Math.floor(secondsPast / 3600)}h`;
  }

  if (secondsPast > 86400) {
    const day = timeStamp.getDate();
    const month = timeStamp.toLocaleString('default', { month: 'short' }); // e.g., "Jan", "Feb"
    const year = timeStamp.getFullYear() === now.getFullYear() ? "" : ` ${timeStamp.getFullYear()}`;
    return `${day} ${month}${year}`;
  }

  return '';
}