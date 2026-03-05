const callGemini = require("../services/geminiService");

exports.evaluateCode = async (req,res)=>{

try{

const { code, language, problem } = req.body;

const prompt = `
Evaluate this ${language} code.

Problem:
${problem}

Code:
${code}

Give:
- score out of 100
- time complexity
- optimization tips
`;

const feedback = await callGemini(prompt);

res.json({ feedback });

}catch(err){
console.error(err);
res.status(500).json({message:"Code evaluation failed"});
}
};