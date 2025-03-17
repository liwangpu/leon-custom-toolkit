export function formatEnglishNumber(num) {
  if (num >= 1000000000) {
    return Math.floor((num / 1000000000) * 100) / 100 + 'B';
  } else if (num >= 1000000) {
    return Math.floor((num / 1000000) * 100) / 100 + 'M';
  } else if (num >= 1000) {
    return Math.floor((num / 1000) * 100) / 100 + 'K';
  } else {
    return Math.floor(num).toString();
  }
}
