export const formatDate = (date: Date) => {
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
};
