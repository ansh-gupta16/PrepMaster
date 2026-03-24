const axios = require('axios');

async function testSubmit() {
  const code = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for(size_t i = 0; i < nums.size(); ++i) {
            for(size_t j = i + 1; j < nums.size(); ++j) {
                if(nums[i] + nums[j] == target) return {static_cast<int>(i), static_cast<int>(j)};
            }
        }
        return {};
    }
};`;

  const payload = {
    code: code,
    language: 'cpp',
    entryPoint: 'twoSum',
    testCases: [
      { input: "[2, 7, 11, 15]\n9", expectedOutput: "[0, 1]", hidden: false },
      { input: "[3, 2, 4]\n6", expectedOutput: "[1, 2]", hidden: false },
      { input: "[3, 3]\n6", expectedOutput: "[0, 1]", hidden: true },
    ]
  };

  try {
    const res = await axios.post('http://127.0.0.1:5000/api/simulator/submit', payload);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Request failed:", err.response ? err.response.data : err.message);
  }
}

testSubmit();
