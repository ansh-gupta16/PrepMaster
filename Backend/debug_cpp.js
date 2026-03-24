const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock simple parts of dockerExecutor logic
function mockWrap(sourceCode, entryPoint, language) {
    let finalCode = sourceCode;
    if (entryPoint) {
      if (language === "javascript") {
          // ...
      } else if (language === "cpp") {
        finalCode = `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <type_traits>
#include <algorithm>

using namespace std;

` + finalCode + `

// --- WRAPPER ---
template <typename T>
T parseArg(const string& str) {
    if constexpr (is_same_v<T, int>) {
        return stoi(str);
    } else if constexpr (is_same_v<T, string>) {
        string s = str;
        if (s.size() >= 2 && s.front() == '"' && s.back() == '"') {
            s = s.substr(1, s.size() - 2);
        }
        return s;
    } else if constexpr (is_same_v<T, vector<int>>) {
        vector<int> res;
        string s = str;
        if (s.size() >= 2 && s.front() == '[' && s.back() == ']') {
            s = s.substr(1, s.size() - 2);
        }
        stringstream ss(s);
        string item;
        while (getline(ss, item, ',')) {
            res.push_back(stoi(item));
        }
        return res;
    } else if constexpr (is_same_v<T, vector<string>>) {
        vector<string> res;
        string s = str;
        if (s.size() >= 2 && s.front() == '[' && s.back() == ']') {
            s = s.substr(1, s.size() - 2);
        }
        stringstream ss(s);
        string item;
        while (getline(ss, item, ',')) {
            // Trim whitespace and quotes
            size_t start = item.find_first_not_of(" \\"");
            size_t end = item.find_last_not_of(" \\"");
            if (start != string::npos && end != string::npos) {
                res.push_back(item.substr(start, end - start + 1));
            }
        }
        return res;
    } else if constexpr (is_same_v<T, vector<char>>) {
        vector<char> res;
        string s = str;
        if (s.size() >= 2 && s.front() == '[' && s.back() == ']') {
            s = s.substr(1, s.size() - 2);
        }
        stringstream ss(s);
        string item;
        while (getline(ss, item, ',')) {
            size_t start = item.find_first_not_of(" \\"");
            if (start != string::npos) {
                res.push_back(item[start]);
            }
        }
        return res;
    }
    return T{};
}

void printRes(int res) { cout << res << endl; }
void printRes(const string& res) { cout << "\\"" << res << "\\"" << endl; }
void printRes(const vector<int>& res) {
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i < res.size() - 1 ? "," : "");
    }
    cout << "]" << endl;
}
void printRes(const vector<string>& res) {
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << "\\"" << res[i] << "\\"" << (i < res.size() - 1 ? "," : "");
    }
    cout << "]" << endl;
}
void printRes(const vector<char>& res) {
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << "\\"" << res[i] << "\\"" << (i < res.size() - 1 ? "," : "");
    }
    cout << "]" << endl;
}

int main() {
    vector<string> inputs;
    string line;
    while (getline(cin, line)) {
        if (!line.empty()) {
            if (line.back() == '\\r') line.pop_back();
            inputs.push_back(line);
        }
    }
    if (inputs.empty()) return 0;

    Solution sol;
    string ep = "${entryPoint}";
    if (ep == "twoSum" && inputs.size() >= 2) {
        auto res = sol.twoSum(parseArg<vector<int>>(inputs[0]), parseArg<int>(inputs[1]));
        printRes(res);
    } else if (ep == "reverseString" && inputs.size() >= 1) {
        auto arg = parseArg<vector<char>>(inputs[0]);
        sol.reverseString(arg);
        printRes(arg);
    } else if (ep == "fizzBuzz" && inputs.size() >= 1) {
        auto res = sol.fizzBuzz(parseArg<int>(inputs[0]));
        printRes(res);
    } else if (ep == "longestCommonPrefix" && inputs.size() >= 1) {
        auto res = sol.longestCommonPrefix(parseArg<vector<string>>(inputs[0]));
        printRes(res);
    }
    return 0;
}
`;
      }
    }
    return finalCode;
}

const source = \`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {0, 1};
    }
};\`;

console.log(mockWrap(source, "twoSum", "cpp"));
