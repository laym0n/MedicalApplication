export const formatDate = (date?: Date) => {
  if (!date) {
    return undefined;
  }
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
};
