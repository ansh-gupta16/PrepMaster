
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <type_traits>
#include <algorithm>

using namespace std;

// User code
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for(size_t i = 0; i < nums.size(); ++i) {
            for(size_t j = i + 1; j < nums.size(); ++j) {
                if(nums[i] + nums[j] == target) return {static_cast<int>(i), static_cast<int>(j)};
            }
        }
        return {};
    }
};

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
            size_t start = item.find_first_not_of(" \"");
            size_t end = item.find_last_not_of(" \"");
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
            size_t start = item.find_first_not_of(" \"");
            if (start != string::npos) {
                res.push_back(item[start]);
            }
        }
        return res;
    }
    return T{};
}

void printRes(int res) { cout << res << endl; }
void printRes(const string& res) { cout << "\"" << res << "\"" << endl; }
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
        cout << "\"" << res[i] << "\"" << (i < res.size() - 1 ? "," : "");
    }
    cout << "]" << endl;
}
void printRes(const vector<char>& res) {
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << "\"" << res[i] << "\"" << (i < res.size() - 1 ? "," : "");
    }
    cout << "]" << endl;
}

int main() {
    vector<string> inputs;
    string line;
    while (getline(cin, line)) {
        if (!line.empty()) {
            if (line.back() == '\r') line.pop_back();
            inputs.push_back(line);
        }
    }
    if (inputs.empty()) return 0;

    Solution sol;
    string ep = "twoSum";
    if (ep == "twoSum" && inputs.size() >= 2) {
        auto arg0 = parseArg<vector<int>>(inputs[0]);
        auto arg1 = parseArg<int>(inputs[1]);
        auto res = sol.twoSum(arg0, arg1);
        printRes(res);
    } else if (ep == "reverseString" && inputs.size() >= 1) {
        auto arg0 = parseArg<vector<char>>(inputs[0]);
        sol.reverseString(arg0);
        printRes(arg0);
    } else if (ep == "fizzBuzz" && inputs.size() >= 1) {
        auto arg0 = parseArg<int>(inputs[0]);
        auto res = sol.fizzBuzz(arg0);
        printRes(res);
    } else if (ep == "longestCommonPrefix" && inputs.size() >= 1) {
        auto arg0 = parseArg<vector<string>>(inputs[0]);
        auto res = sol.longestCommonPrefix(arg0);
        printRes(res);
    }
    return 0;
}
