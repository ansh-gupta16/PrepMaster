/**
 * Automatically enhances a raw string description into a structured object.
 * Uses pattern matching to extract sections like Overview, Explanation, Examples, etc.
 */
function enhanceDescription(q) {
  const { title, description, constraints, examples } = q;
  
  const structured = {
    overview: "",
    explanation: "",
    inputFormat: "",
    outputFormat: "",
    exampleWalkthrough: "",
    constraintsExplanation: "",
    hints: []
  };

  // 1. Overview (First paragraph usually)
  const paragraphs = description.split('\n\n');
  structured.overview = paragraphs[0] || description;

  // 2. Explanation (Rest of the text before examples)
  if (paragraphs.length > 1) {
    const mainBody = paragraphs.slice(1).join('\n\n');
    // Filter out parts that look like examples or constraints if they are repeated
    structured.explanation = mainBody.split('###')[0].trim();
  }

  // 3. Auto-generate Input/Output format based on title and examples
  // This is a heuristic approach
  if (examples && examples.length > 0) {
    structured.inputFormat = `The input consists of parameters as specified in the problem signature. For example: ${examples[0].input.replace('\n', ', ')}`;
    structured.outputFormat = `Return the result as specified. Expected output for the example: ${examples[0].output}`;
    
    // 4. Example Walkthrough
    structured.exampleWalkthrough = `For the input: \`${examples[0].input.replace('\n', ' and ')}\`, the expected output is \`${examples[0].output}\`. \n\nThis is derived by applying the ${title.toLowerCase()} logic described above.`;
  }

  // 5. Constraints Explanation
  if (constraints && constraints.length > 0) {
    structured.constraintsExplanation = `The solution must handle the following boundaries:\n${constraints.map(c => `- ${c}`).join('\n')}`;
  } else {
    structured.constraintsExplanation = "Follow the standard complexity requirements for this difficulty level.";
  }

  // 6. Default Hints based on difficulty
  if (q.difficulty === 'Easy') {
    structured.hints = [
      "Try a brute force approach first.",
      "Consider using built-in language functions for string/array manipulation."
    ];
  } else if (q.difficulty === 'Medium') {
    structured.hints = [
      "Can you optimize the time complexity using a Hash Map or Two Pointers?",
      "Think about edge cases like empty inputs or very large numbers."
    ];
  } else {
    structured.hints = [
      "Consider using Dynamic Programming or a specialized Data Structure (like a Trie or Segment Tree).",
      "Look for sub-problems that can be solved independently.",
      "The optimal complexity is likely O(N) or O(N log N)."
    ];
  }

  return structured;
}

module.exports = { enhanceDescription };
