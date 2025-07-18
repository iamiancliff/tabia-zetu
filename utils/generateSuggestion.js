module.exports = function generateSuggestion(logs) {
  if (!logs || logs.length === 0) {
    return ["No behavior logs available to analyze."];
  }

  const freq = {};
  logs.forEach(log => {
    const behavior = log.behaviorType;
    if (behavior) {
      freq[behavior] = (freq[behavior] || 0) + 1;
    }
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return ["No significant behavior patterns found."];
  }

  const [mostCommon, count] = sorted[0];

  return [
    `Most frequent behavior: '${mostCommon}' (${count} times). Consider addressing it.`,
  ];
};
