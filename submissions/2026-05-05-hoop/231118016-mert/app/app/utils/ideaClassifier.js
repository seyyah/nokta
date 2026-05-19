export const classifyIdea = (idea) => {
  if (!idea) return "Uncategorized";
  
  const text = idea.toLowerCase();
  
  if (text.includes("fitness") || text.includes("health") || text.includes("medical")) {
    return "Health";
  }
  if (text.includes("study") || text.includes("learn") || text.includes("education")) {
    return "Education";
  }
  if (text.includes("drone") || text.includes("farm") || text.includes("agriculture")) {
    return "AgriTech";
  }
  if (text.includes("market") || text.includes("shop") || text.includes("buy") || text.includes("sell")) {
    return "E-commerce";
  }
  if (text.includes("ai") || text.includes("artificial intelligence") || text.includes("machine learning")) {
    return "AI Tool";
  }
  
  return "General";
};
