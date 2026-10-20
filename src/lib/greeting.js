export function greeting(name, now = new Date()) {
  const h = now.getHours();
  const g = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  return `${g}, ${name}!`;
}
