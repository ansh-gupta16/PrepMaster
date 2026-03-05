


/*
===================================================
 ANALYZE USER PERFORMANCE
===================================================
*/

exports.analyzePerformance = (questions, answers) => {
  let score = 0;
  let weakConcepts = {};
  let heatmap = {};

  questions.forEach((q, index) => {
    const userAns = answers[index];

    const concept = q.concept || "General";

    // Initialize heatmap tracking
    if (!heatmap[concept]) {
      heatmap[concept] = {
        correct: 0,
        wrong: 0,
      };
    }

    // MCQ Logic
    if (q.type === "mcq") {
      if (userAns === q.correctAnswer) {
        score++;
        heatmap[concept].correct++;
      } else {
        heatmap[concept].wrong++;
        weakConcepts[concept] = (weakConcepts[concept] || 0) + 1;
      }
    }

    // Subjective Logic (basic length validation)
    if (q.type === "subjective") {
      if (userAns && userAns.length > 15) {
        score++;
        heatmap[concept].correct++;
      } else {
        heatmap[concept].wrong++;
        weakConcepts[concept] = (weakConcepts[concept] || 0) + 1;
      }
    }
  });

  const percentage = Math.round((score / questions.length) * 100);

  return {
    score,
    percentage,
    weakAreas: Object.keys(weakConcepts),
    heatmap,
  };
};


/*
===================================================
ADAPTIVE DIFFICULTY ENGINE
===================================================
*/

exports.getNextDifficulty = (percentage, currentDifficulty) => {
  if (percentage >= 80) {
    if (currentDifficulty === "Easy") return "Medium";
    if (currentDifficulty === "Medium") return "Hard";
    return "Hard";
  }

  if (percentage >= 50) {
    return currentDifficulty;
  }

  if (percentage < 50) {
    if (currentDifficulty === "Hard") return "Medium";
    if (currentDifficulty === "Medium") return "Easy";
    return "Easy";
  }

  return currentDifficulty;
};


/*
===================================================
SMART RECOMMENDATION ENGINE
===================================================
*/

exports.generateRecommendations = (weakAreas) => {
  if (!weakAreas || weakAreas.length === 0) {
    return [
      "Excellent performance! Try harder challenges.",
      "Move to advanced interview simulations.",
    ];
  }

  return weakAreas.map(
    (concept) =>
      `Focus on improving ${concept}. Practice targeted problems and review core theory.`
  );
};