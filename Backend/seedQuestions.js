require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const Question = require('./models/Question');

// MongoDB Connection from .env
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI not found in .env");
  process.exit(1);
}

const questions = [
  // --- EASY QUESTIONS (1-10) ---
  {
    title: "Two Sum",
    difficulty: "Easy",
    desc: "Find indices of two numbers that add up to target.",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
    examples: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" }
    ],
    testCases: [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]", hidden: false },
      { input: "[3,2,4]\n6", expectedOutput: "[1,2]", hidden: false },
      { input: "[3,3]\n6", expectedOutput: "[0,1]", hidden: true }
    ],
    entryPoint: "twoSum",
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Write your code here\n}",
      python: "def two_sum(nums, target):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Palindrome Check",
    difficulty: "Easy",
    desc: "Determine if a string reads the same forward and backward.",
    description: "Given a string `s`, return `true` if it is a palindrome, or `false` otherwise. A palindrome is a word, phrase, number, or other sequence of characters that reads the same forward and backward.\n\n### Example 1:\n**Input:** s = \"racecar\"\n**Output:** true\n\n### Example 2:\n**Input:** s = \"hello\"\n**Output:** false",
    constraints: ["The string will only contain lowercase alphanumeric characters.", "1 <= s.length <= 10^5"],
    examples: [
      { input: "\"racecar\"", output: "true" },
      { input: "\"hello\"", output: "false" }
    ],
    testCases: [
      { input: "\"racecar\"", expectedOutput: "true", hidden: false },
      { input: "\"hello\"", expectedOutput: "false", hidden: false },
      { input: "\"madam\"", expectedOutput: "true", hidden: true },
      { input: "\"a\"", expectedOutput: "true", hidden: true },
      { input: "\"ab\"", expectedOutput: "false", hidden: true }
    ],
    entryPoint: "isPalindrome",
    starterCode: {
      javascript: "function isPalindrome(s) {\n  // Write your code here\n}",
      python: "def is_palindrome(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your code here\n        return false;\n    }\n};"
    }
  },
  {
    title: "Reverse String",
    difficulty: "Easy",
    desc: "Reverse a string or array of characters in-place.",
    description: "Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place.",
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    examples: [
      { input: "[\"h\",\"e\",\"l\",\"l\",\"o\"]", output: "[\"o\",\"l\",\"l\",\"e\",\"h\"]" }
    ],
    testCases: [
      { input: "[\"h\",\"e\",\"l\",\"l\",\"o\"]", expectedOutput: "[\"o\",\"l\",\"l\",\"e\",\"h\"]", hidden: false },
      { input: "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", expectedOutput: "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]", hidden: true }
    ],
    entryPoint: "reverseString",
    starterCode: {
      javascript: "function reverseString(s) {\n  // Write your code here\n}",
      python: "def reverse_string(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public void reverseString(char[] s) {\n        // Write your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Write your code here\n    }\n};"
    }
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    desc: "Check if the input string has valid matching parentheses.",
    description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only."],
    examples: [
      { input: "\"()\"", output: "true" },
      { input: "\"()[]{}\"", output: "true" },
      { input: "\"(]\"", output: "false" }
    ],
    testCases: [
      { input: "\"()\"", expectedOutput: "true", hidden: false },
      { input: "\"(]\"", expectedOutput: "false", hidden: false },
      { input: "\"()[]{}\"", expectedOutput: "true", hidden: true },
      { input: "\"{[]}\"", expectedOutput: "true", hidden: true }
    ],
    entryPoint: "isValid",
    starterCode: {
      javascript: "function isValid(s) {\n  // Write your code here\n}",
      python: "def is_valid(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};"
    }
  },
  {
    title: "Fibonacci Number",
    difficulty: "Easy",
    desc: "Return the nth Fibonacci number.",
    description: "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is:\n\n`F(0) = 0, F(1) = 1`\n`F(n) = F(n-1) + F(n-2)`, for `n > 1`.\n\nGiven `n`, calculate `F(n)`.",
    constraints: ["0 <= n <= 30"],
    examples: [
      { input: "2", output: "1" },
      { input: "3", output: "2" },
      { input: "4", output: "3" }
    ],
    testCases: [
      { input: "2", expectedOutput: "1", hidden: false },
      { input: "3", expectedOutput: "2", hidden: false },
      { input: "4", expectedOutput: "3", hidden: true },
      { input: "10", expectedOutput: "55", hidden: true }
    ],
    entryPoint: "fib",
    starterCode: {
      javascript: "function fib(n) {\n  // Write your code here\n}",
      python: "def fib(n):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int fib(int n) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int fib(int n) {\n        // Write your code here\n        return 0;\n    }\n};"
    }
  },
  {
    title: "Find Maximum Element",
    difficulty: "Easy",
    desc: "Return the maximum value in an array.",
    description: "Given an array of integers `nums`, return the maximum value in the array.",
    constraints: ["1 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    examples: [
      { input: "[1, 3, 2, 5, 4]", output: "5" }
    ],
    testCases: [
      { input: "[1, 3, 2, 5, 4]", expectedOutput: "5", hidden: false },
      { input: "[-1, -5, -2]", expectedOutput: "-1", hidden: true },
      { input: "[100]", expectedOutput: "100", hidden: true }
    ],
    entryPoint: "findMax",
    starterCode: {
      javascript: "function findMax(nums) {\n  // Write your code here\n}",
      python: "def find_max(nums):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int findMax(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int findMax(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};"
    }
  },
  {
    title: "Count Vowels",
    difficulty: "Easy",
    desc: "Count the number of vowels in a string.",
    description: "Given a string `s`, count the number of vowels (a, e, i, o, u) present in the string. Case doesn't matter.",
    constraints: ["1 <= s.length <= 10^4"],
    examples: [
      { input: "\"hello world\"", output: "3" }
    ],
    testCases: [
      { input: "\"hello world\"", expectedOutput: "3", hidden: false },
      { input: "\"PREPMASTER\"", expectedOutput: "3", hidden: true },
      { input: "\"xyz\"", expectedOutput: "0", hidden: true }
    ],
    entryPoint: "countVowels",
    starterCode: {
      javascript: "function countVowels(s) {\n  // Write your code here\n}",
      python: "def count_vowels(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int countVowels(String s) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int countVowels(string s) {\n        // Write your code here\n        return 0;\n    }\n};"
    }
  },
  {
    title: "Merge Two Sorted Arrays",
    difficulty: "Easy",
    desc: "Merge two sorted arrays into one sorted array.",
    description: "You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order. Merge `nums1` and `nums2` into a single array sorted in non-decreasing order.",
    constraints: ["0 <= nums1.length, nums2.length <= 200", "-100 <= nums1[i], nums2[j] <= 100"],
    examples: [
      { input: "[1,2,3]\n[2,5,6]", output: "[1,2,2,3,5,6]" }
    ],
    testCases: [
      { input: "[1,2,3]\n[2,5,6]", expectedOutput: "[1,2,2,3,5,6]", hidden: false },
      { input: "[]\n[1]", expectedOutput: "[1]", hidden: true },
      { input: "[1]\n[]", expectedOutput: "[1]", hidden: true }
    ],
    entryPoint: "mergeSorted",
    starterCode: {
      javascript: "function mergeSorted(nums1, nums2) {\n  // Write your code here\n}",
      python: "def merge_sorted(nums1, nums2):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] mergeSorted(int[] nums1, int[] nums2) {\n        // Write your code here\n        return new int[0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> mergeSorted(vector<int>& nums1, vector<int>& nums2) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Remove Duplicates",
    difficulty: "Easy",
    desc: "Remove duplicates from a sorted array.",
    description: "Given a sorted array `nums`, remove the duplicates in-place such that each element appears only once and return the new array.",
    constraints: ["0 <= nums.length <= 10^4", "-100 <= nums[i] <= 100"],
    examples: [
      { input: "[1,1,2]", output: "[1,2]" }
    ],
    testCases: [
      { input: "[1,1,2]", expectedOutput: "[1,2]", hidden: false },
      { input: "[0,0,1,1,1,2,2,3,3,4]", expectedOutput: "[0,1,2,3,4]", hidden: true }
    ],
    entryPoint: "removeDuplicates",
    starterCode: {
      javascript: "function removeDuplicates(nums) {\n  // Write your code here\n}",
      python: "def remove_duplicates(nums):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] removeDuplicates(int[] nums) {\n        // Write your code here\n        return new int[0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> removeDuplicates(vector<int>& nums) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Factorial",
    difficulty: "Easy",
    desc: "Calculate the factorial of a number.",
    description: "Given a non-negative integer `n`, return the factorial of `n`. Factorial of `n` (n!) is the product of all positive integers less than or equal to `n`.",
    constraints: ["0 <= n <= 12"],
    examples: [
      { input: "5", output: "120" }
    ],
    testCases: [
      { input: "5", expectedOutput: "120", hidden: false },
      { input: "0", expectedOutput: "1", hidden: true },
      { input: "10", expectedOutput: "3628800", hidden: true }
    ],
    entryPoint: "factorial",
    starterCode: {
      javascript: "function factorial(n) {\n  // Write your code here\n}",
      python: "def factorial(n):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int factorial(int n) {\n        // Write your code here\n        return 1;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int factorial(int n) {\n        // Write your code here\n        return 1;\n    }\n};"
    }
  },

  // --- MEDIUM QUESTIONS (11-20) ---
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    desc: "Find the length of the longest substring with unique characters.",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    examples: [
      { input: "\"abcabcbb\"", output: "3" },
      { input: "\"bbbbb\"", output: "1" }
    ],
    testCases: [
      { input: "\"abcabcbb\"", expectedOutput: "3", hidden: false },
      { input: "\"bbbbb\"", expectedOutput: "1", hidden: false },
      { input: "\"pwwkew\"", expectedOutput: "3", hidden: true },
      { input: "\"\"", expectedOutput: "0", hidden: true }
    ],
    entryPoint: "lengthOfLongestSubstring",
    starterCode: {
      javascript: "function lengthOfLongestSubstring(s) {\n  // Write your code here\n}",
      python: "def length_of_longest_substring(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        return 0;\n    }\n};"
    }
  },
  {
    title: "Binary Search",
    difficulty: "Medium",
    desc: "Find a target in a sorted array efficiently.",
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All elements in nums are unique.", "nums is sorted in ascending order."],
    examples: [
      { input: "[-1,0,3,5,9,12]\n9", output: "4" }
    ],
    testCases: [
      { input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4", hidden: false },
      { input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1", hidden: true }
    ],
    entryPoint: "search",
    starterCode: {
      javascript: "function search(nums, target) {\n  // Write your code here\n}",
      python: "def search(nums, target):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your code here\n        return -1;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your code here\n        return -1;\n    }\n};"
    }
  },
  {
    title: "Container With Most Water",
    difficulty: "Medium",
    desc: "Find the max area formed by two lines.",
    description: "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.",
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    examples: [
      { input: "[1,8,6,2,5,4,8,3,7]", output: "49" }
    ],
    testCases: [
      { input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49", hidden: false },
      { input: "[1,1]", expectedOutput: "1", hidden: true }
    ],
    entryPoint: "maxArea",
    starterCode: {
      javascript: "function maxArea(height) {\n  // Write your code here\n}",
      python: "def max_area(height):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int maxArea(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your code here\n        return 0;\n    }\n};"
    }
  },
  {
    title: "Group Anagrams",
    difficulty: "Medium",
    desc: "Group strings that are anagrams.",
    description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
    examples: [
      { input: "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", output: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]" }
    ],
    testCases: [
      { input: "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", expectedOutput: "[[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"],[\"bat\"]]", hidden: false },
      { input: "[\"\"]", expectedOutput: "[[\"\"]]", hidden: true },
      { input: "[\"a\"]", expectedOutput: "[[\"a\"]]", hidden: true }
    ],
    entryPoint: "groupAnagrams",
    starterCode: {
      javascript: "function groupAnagrams(strs) {\n  // Write your code here\n}",
      python: "def group_anagrams(strs):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Product of Array Except Self",
    difficulty: "Medium",
    desc: "Return a product array without using division.",
    description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.",
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
    examples: [
      { input: "[1,2,3,4]", output: "[24,12,8,6]" }
    ],
    testCases: [
      { input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]", hidden: false },
      { input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]", hidden: true }
    ],
    entryPoint: "productExceptSelf",
    starterCode: {
      javascript: "function productExceptSelf(nums) {\n  // Write your code here\n}",
      python: "def product_except_self(nums):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Write your code here\n        return new int[0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Rotate Array",
    difficulty: "Medium",
    desc: "Rotate an array by k steps.",
    description: "Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.",
    constraints: ["1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1", "0 <= k <= 10^5"],
    examples: [
      { input: "[1,2,3,4,5,6,7]\n3", output: "[5,6,7,1,2,3,4]" }
    ],
    testCases: [
      { input: "[1,2,3,4,5,6,7]\n3", expectedOutput: "[5,6,7,1,2,3,4]", hidden: false },
      { input: "[-1,-100,3,99]\n2", expectedOutput: "[3,99,-1,-100]", hidden: true }
    ],
    entryPoint: "rotate",
    starterCode: {
      javascript: "function rotate(nums, k) {\n  // Write your code here\n}",
      python: "def rotate(nums, k):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public void rotate(int[] nums, int k) {\n        // Write your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        // Write your code here\n    }\n};"
    }
  },
  {
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    desc: "Find target in a rotated sorted array.",
    description: "There is an integer array `nums` sorted in ascending order (with distinct values). Prior to being passed to your function, `nums` is possibly rotated at an unknown pivot index `k`.\n\nGiven the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.",
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4", "All values of nums are unique."],
    examples: [
      { input: "[4,5,6,7,0,1,2]\n0", output: "4" }
    ],
    testCases: [
      { input: "[4,5,6,7,0,1,2]\n0", expectedOutput: "4", hidden: false },
      { input: "[4,5,6,7,0,1,2]\n3", expectedOutput: "-1", hidden: true }
    ],
    entryPoint: "search",
    starterCode: {
      javascript: "function search(nums, target) {\n  // Write your code here\n}",
      python: "def search(nums, target):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your code here\n        return -1;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your code here\n        return -1;\n    }\n};"
    }
  },
  {
    title: "Set Matrix Zeroes",
    difficulty: "Medium",
    desc: "Modify matrix such that rows/cols with zeros are zeroed.",
    description: "Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0`. Do it in-place.",
    constraints: ["m == matrix.length", "n == matrix[0].length", "1 <= m, n <= 200"],
    examples: [
      { input: "[[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]" }
    ],
    testCases: [
      { input: "[[1,1,1],[1,0,1],[1,1,1]]", expectedOutput: "[[1,0,1],[0,0,0],[1,0,1]]", hidden: false },
      { input: "[[0,1,2,0],[3,4,5,2],[1,3,1,5]]", expectedOutput: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]", hidden: true }
    ],
    entryPoint: "setZeroes",
    starterCode: {
      javascript: "function setZeroes(matrix) {\n  // Write your code here\n}",
      python: "def set_zeroes(matrix):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public void setZeroes(int[][] matrix) {\n        // Write your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    void setZeroes(vector<vector<int>>& matrix) {\n        // Write your code here\n    }\n};"
    }
  },
  {
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    desc: "Return the k most frequent elements.",
    description: "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.",
    constraints: ["1 <= nums.length <= 10^5", "k is in the range [1, the number of unique elements in the array]."],
    examples: [
      { input: "[1,1,1,2,2,3]\n2", output: "[1,2]" }
    ],
    testCases: [
      { input: "[1,1,1,2,2,3]\n2", expectedOutput: "[1,2]", hidden: false },
      { input: "[1]\n1", expectedOutput: "[1]", hidden: true }
    ],
    entryPoint: "topKFrequent",
    starterCode: {
      javascript: "function topKFrequent(nums, k) {\n  // Write your code here\n}",
      python: "def top_k_frequent(nums, k):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        // Write your code here\n        return new int[0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Longest Common Prefix",
    difficulty: "Medium",
    desc: "Find the longest common prefix shared by strings.",
    description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string \"\".",
    constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] consists of only lowercase English letters."],
    examples: [
      { input: "[\"flower\",\"flow\",\"flight\"]", output: "\"fl\"" }
    ],
    testCases: [
      { input: "[\"flower\",\"flow\",\"flight\"]", expectedOutput: "\"fl\"", hidden: false },
      { input: "[\"dog\",\"racecar\",\"car\"]", expectedOutput: "\"\"", hidden: true }
    ],
    entryPoint: "longestCommonPrefix",
    starterCode: {
      javascript: "function longestCommonPrefix(strs) {\n  // Write your code here\n}",
      python: "def longest_common_prefix(strs):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        // Write your code here\n        return \"\";\n    }\n}",
      cpp: "class Solution {\npublic:\n    string longestCommonPrefix(vector<string>& strs) {\n        // Write your code here\n        return \"\";\n    }\n};"
    }
  },

  // --- HARD QUESTIONS (21-30) ---
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    desc: "Find the median of two sorted arrays in logarithmic time.",
    description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.",
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m, n <= 1000", "-10^6 <= nums1[i], nums2[j] <= 10^6"],
    examples: [
      { input: "[1,3]\n[2]", output: "2.0" }
    ],
    testCases: [
      { input: "[1,3]\n[2]", expectedOutput: "2.0", hidden: false },
      { input: "[1,2]\n[3,4]", expectedOutput: "2.5", hidden: true }
    ],
    entryPoint: "findMedianSortedArrays",
    starterCode: {
      javascript: "function findMedianSortedArrays(nums1, nums2) {\n  // Write your code here\n}",
      python: "def find_median_sorted_arrays(nums1, nums2):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n        return 0.0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your code here\n        return 0.0;\n    }\n};"
    }
  },
  {
    title: "Trapping Rain Water",
    difficulty: "Hard",
    desc: "Calculate trapped rain water between bars.",
    description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    examples: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }
    ],
    testCases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6", hidden: false },
      { input: "[4,2,0,3,2,5]", expectedOutput: "9", hidden: true }
    ],
    entryPoint: "trap",
    starterCode: {
      javascript: "function trap(height) {\n  // Write your code here\n}",
      python: "def trap(height):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int trap(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your code here\n        return 0;\n    }\n};"
    }
  },
  {
    title: "N-Queens",
    difficulty: "Hard",
    desc: "Place N queens on a board safely.",
    description: "The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other.\n\nGiven an integer `n`, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.",
    constraints: ["1 <= n <= 9"],
    examples: [
      { input: "4", output: "[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]" }
    ],
    testCases: [
      { input: "4", expectedOutput: "[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]", hidden: false },
      { input: "1", expectedOutput: "[[\"Q\"]]", hidden: true }
    ],
    entryPoint: "solveNQueens",
    starterCode: {
      javascript: "function solveNQueens(n) {\n  // Write your code here\n}",
      python: "def solve_n_queens(n):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public List<List<String>> solveNQueens(int n) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<string>> solveNQueens(int n) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Sliding Window Maximum",
    difficulty: "Hard",
    desc: "Find max values in subarrays of size k.",
    description: "You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position.\n\nReturn the max sliding window.",
    constraints: ["1 <= nums.length <= 10^5", "1 <= k <= nums.length"],
    examples: [
      { input: "[1,3,-1,-3,5,3,6,7]\n3", output: "[3,3,5,5,6,7]" }
    ],
    testCases: [
      { input: "[1,3,-1,-3,5,3,6,7]\n3", expectedOutput: "[3,3,5,5,6,7]", hidden: false },
      { input: "[1]\n1", expectedOutput: "[1]", hidden: true }
    ],
    entryPoint: "maxSlidingWindow",
    starterCode: {
      javascript: "function maxSlidingWindow(nums, k) {\n  // Write your code here\n}",
      python: "def max_sliding_window(nums, k):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Write your code here\n        return new int[0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Minimum Window Substring",
    difficulty: "Hard",
    desc: "Find smallest substring containing all chars of another string.",
    description: "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
    constraints: ["1 <= m, n <= 10^5", "s and t consist of uppercase and lowercase English letters."],
    examples: [
      { input: "\"ADOBECODEBANC\"\n\"ABC\"", output: "\"BANC\"" }
    ],
    testCases: [
      { input: "\"ADOBECODEBANC\"\n\"ABC\"", expectedOutput: "\"BANC\"", hidden: false },
      { input: "\"a\"\n\"a\"", expectedOutput: "\"a\"", hidden: true },
      { input: "\"a\"\n\"aa\"", expectedOutput: "\"\"", hidden: true }
    ],
    entryPoint: "minWindow",
    starterCode: {
      javascript: "function minWindow(s, t) {\n  // Write your code here\n}",
      python: "def min_window(s, t):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public String minWindow(String s, String t) {\n        // Write your code here\n        return \"\";\n    }\n}",
      cpp: "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        // Write your code here\n        return \"\";\n    }\n};"
    }
  },
  {
    title: "Regular Expression Matching",
    difficulty: "Hard",
    desc: "Implement regex matching with . and * support.",
    description: "Given an input string `s` and a pattern `p`, implement regular expression matching with support for `.` and `*` where:\n- `.` Matches any single character.\n- `*` Matches zero or more of the preceding element.",
    constraints: ["1 <= s.length <= 20", "1 <= p.length <= 20", "s consists of only lowercase English letters.", "p consists of lowercase English letters, '.', and '*'."],
    examples: [
      { input: "\"aa\"\n\"a*\"", output: "true" },
      { input: "\"ab\"\n\".*\"", output: "true" }
    ],
    testCases: [
      { input: "\"aa\"\n\"a*\"", expectedOutput: "true", hidden: false },
      { input: "\"ab\"\n\".*\"", expectedOutput: "true", hidden: false },
      { input: "\"mississippi\"\n\"mis*is*p*.\"", expectedOutput: "false", hidden: true }
    ],
    entryPoint: "isMatch",
    starterCode: {
      javascript: "function isMatch(s, p) {\n  // Write your code here\n}",
      python: "def is_match(s, p):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean isMatch(String s, String p) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isMatch(string s, string p) {\n        // Write your code here\n        return false;\n    }\n};"
    }
  },
  {
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    desc: "Merge K sorted lists into one.",
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it. (Note: For this simulator, input will be given as a 2D array of integers).",
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500"],
    examples: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }
    ],
    testCases: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]", hidden: false },
      { input: "[]", expectedOutput: "[]", hidden: true }
    ],
    entryPoint: "mergeKLists",
    starterCode: {
      javascript: "function mergeKLists(lists) {\n  // Write your code here\n}",
      python: "def merge_k_lists(lists):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] mergeKLists(int[][] lists) {\n        // Write your code here\n        return new int[0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> mergeKLists(vector<vector<int>>& lists) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Word Ladder",
    difficulty: "Hard",
    desc: "Find shortest transformation sequence from one word to another.",
    description: "A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that:\n- Every adjacent pair of words differs by a single letter.\n- Every `si` for `1 <= i <= k` is in `wordList`.\n\nGiven two words, `beginWord` and `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence, or 0 if no such sequence exists.",
    constraints: ["1 <= beginWord.length <= 10", "wordList.length <= 5000"],
    examples: [
      { input: "\"hit\"\n\"cog\"\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", output: "5" }
    ],
    testCases: [
      { input: "\"hit\"\n\"cog\"\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", expectedOutput: "5", hidden: false },
      { input: "\"hit\"\n\"cog\"\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]", expectedOutput: "0", hidden: true }
    ],
    entryPoint: "ladderLength",
    starterCode: {
      javascript: "function ladderLength(beginWord, endWord, wordList) {\n  // Write your code here\n}",
      python: "def ladder_length(begin_word, end_word, word_list):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        // Write your code here\n        return 0;\n    }\n};"
    }
  },
  {
    title: "LRU Cache",
    difficulty: "Hard",
    desc: "Implement a Least Recently Used (LRU) cache.",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. (Note: For this simulator, you will receive a list of commands and values to execute on your cache implementation).",
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5"],
    examples: [
      { input: "[\"LRUCache\",\"put\",\"put\",\"get\",\"put\",\"get\",\"put\",\"get\",\"get\",\"get\"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]", output: "[null,null,null,1,null,-1,null,-1,3,4]" }
    ],
    testCases: [
      { input: "[\"LRUCache\",\"put\",\"put\",\"get\",\"put\",\"get\",\"put\",\"get\",\"get\",\"get\"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]", expectedOutput: "[null,null,null,1,null,-1,null,-1,3,4]", hidden: false }
    ],
    entryPoint: "lruCacheExec",
    starterCode: {
      javascript: "function lruCacheExec(commands, values) {\n  // Write your code here\n}",
      python: "def lru_cache_exec(commands, values):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public List<Object> lruCacheExec(String[] commands, int[][] values) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<string> lruCacheExec(vector<string>& commands, vector<vector<int>>& values) {\n        // Write your code here\n        return {};\n    }\n};"
    }
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "Hard",
    desc: "Convert tree to string and back.",
    description: "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer. Design an algorithm to serialize and deserialize a binary tree.",
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
    examples: [
      { input: "[1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]" }
    ],
    testCases: [
      { input: "[1,2,3,null,null,4,5]", expectedOutput: "[1,2,3,null,null,4,5]", hidden: false },
      { input: "[]", expectedOutput: "[]", hidden: true }
    ],
    entryPoint: "serializeDeserialize",
    starterCode: {
      javascript: "function serializeDeserialize(root) {\n  // Write your code here\n}",
      python: "def serialize_deserialize(root):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public String serializeDeserialize(String data) {\n        // Write your code here\n        return \"\";\n    }\n}",
      cpp: "class Solution {\npublic:\n    string serializeDeserialize(string data) {\n        // Write your code here\n        return \"\";\n    }\n};"
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    for (const q of questions) {
      await Question.findOneAndUpdate({ title: q.title }, q, { upsert: true, new: true });
      console.log(`Seeded: ${q.title}`);
    }

    console.log("All questions seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
