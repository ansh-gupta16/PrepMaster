const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const LANG_CONFIG = {
  javascript: {
    image: "node:20-alpine",
    filename: "solution.js",
    cmd: (f) => ["node", `/code/${f}`],
  },
  python: {
    image: "python:3.12-alpine",
    filename: "solution.py",
    cmd: (f) => ["python3", `/code/${f}`],
  },
  java: {
    image: "eclipse-temurin:17-jdk-alpine",
    filename: "Main.java",
    cmd: (f) => ["sh", "-c", `cp /code/${f} /tmp/${f} && cd /tmp && javac ${f} && java Main`],
  },
  cpp: {
    image: "gcc:latest",
    filename: "solution.cpp",
    cmd: (f) => ["sh", "-c", `cp /code/${f} /tmp/${f} && cd /tmp && g++ -std=c++17 -o solution ${f} && ./solution`],
  },
};

const EXEC_TIMEOUT = 10000;

async function executeCode(sourceCode, language, stdin = "", entryPoint = "") {
  const config = LANG_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  const execId = crypto.randomBytes(8).toString("hex");
  const tmpDir = path.join(os.tmpdir(), `pm_exec_${execId}`);

  try {
    fs.mkdirSync(tmpDir, { recursive: true });

    let finalCode = sourceCode;
    let lineOffset = 0;

    if (entryPoint) {
      if (language === "javascript") {
        const prelude = `// Standard JS Template\n`;
        const postlude = `\n\n// --- WRAPPER ---\nconst fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\nif (input) {\n  const args = input.split('\\n').map(line => {\n    try { return JSON.parse(line); } catch(e) { return line; }\n  });\n  const res = ${entryPoint}(...args);\n  if ("${entryPoint}" === "reverseString") {\n    console.log(JSON.stringify(args[0]));\n  } else if (res !== undefined) {\n    console.log(typeof res === 'object' ? JSON.stringify(res) : res);\n  }\n}`;
        finalCode = prelude + sourceCode + postlude;
        lineOffset = prelude.split("\n").length - 1;
      } else if (language === "python") {
        const prelude = `# Standard Python Template\n`;
        const postlude = `\n\n# --- WRAPPER ---\nimport sys, json, re\ninput_data = sys.stdin.read().strip()\nif input_data:\n    raw_args = input_data.split('\\n')\n    args = []\n    for line in raw_args:\n        try:\n            line = line.strip()\n            if not line: continue\n            args.append(json.loads(line))\n        except:\n            args.append(line)\n    target_name = "${entryPoint}"\n    func = globals().get(target_name)\n    if not func:\n        snake_name = re.sub(r'(?<!^)(?=[A-Z])', '_', target_name).lower()\n        func = globals().get(snake_name)\n    if func:\n        res = func(*args)\n        if "${entryPoint}" == "reverseString":\n            print(json.dumps(args[0]).replace(" ", ""))\n        elif res is not None:\n            print(json.dumps(res).replace(" ", "") if isinstance(res, (list, dict)) else res)\n    else:\n        print(f"Error: Function '${entryPoint}' not found", file=sys.stderr)`;
        finalCode = prelude + sourceCode + postlude;
        lineOffset = prelude.split("\n").length - 1;
      } else if (language === "java") {
        const prelude = `import java.util.*;\nimport java.lang.reflect.*;\n\n`;
        const postlude = `\n\n// --- WRAPPER ---\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        Scanner sc = new Scanner(System.in);\n        List<String> inputs = new ArrayList<>();\n        while(sc.hasNextLine()) {\n            String line = sc.nextLine().trim();\n            if(!line.isEmpty()) inputs.add(line);\n        }\n        if (inputs.isEmpty()) return;\n        Solution sol = new Solution();\n        Method[] methods = Solution.class.getDeclaredMethods();\n        Method target = null;\n        for (Method m : methods) {\n            if (m.getName().equals("${entryPoint}")) {\n                target = m; break;\n            }\n        }\n        if (target == null) return;\n        Object[] parsedArgs = new Object[target.getParameterCount()];\n        Class<?>[] pTypes = target.getParameterTypes();\n        for (int i = 0; i < pTypes.length && i < inputs.size(); i++) {\n            String val = inputs.get(i);\n            if (pTypes[i] == int.class) parsedArgs[i] = Integer.parseInt(val);\n            else if (pTypes[i] == String.class) parsedArgs[i] = val.replaceAll("^\\"|\\"$", "");\n            else if (pTypes[i] == int[].class) {\n                val = val.replaceAll("^\\\\[|\\\\]$", "");\n                if (val.isEmpty()) parsedArgs[i] = new int[0];\n                else {\n                    String[] parts = val.split(",");\n                    int[] arr = new int[parts.length];\n                    for(int j=0; j<parts.length; j++) arr[j] = Integer.parseInt(parts[j].trim());\n                    parsedArgs[i] = arr;\n                }\n            }\n            else if (pTypes[i] == String[].class) {\n                 val = val.replaceAll("^\\\\[|\\\\]$", "");\n                 if(val.isEmpty()) parsedArgs[i] = new String[0];\n                 else {\n                     String[] parts = val.split(",");\n                     String[] arr = new String[parts.length];\n                     for(int j=0; j<parts.length; j++) arr[j] = parts[j].trim().replaceAll("^\\"|\\"$", "");\n                     parsedArgs[i] = arr;\n                 }\n            }\n            else if (pTypes[i] == char[].class) {\n                 val = val.replaceAll("^\\\\[|\\\\]$", "");\n                 if(val.isEmpty()) parsedArgs[i] = new char[0];\n                 else {\n                     String[] parts = val.split(",");\n                     char[] arr = new char[parts.length];\n                     for(int j=0; j<parts.length; j++) {\n                         String s = parts[j].trim().replaceAll("^[\\"']|[\\"']$", "");\n                         arr[j] = s.isEmpty() ? ' ' : s.charAt(0);\n                     }\n                     parsedArgs[i] = arr;\n                 }\n            }\n        }\n        Object res = target.invoke(sol, parsedArgs);\n        if ("${entryPoint}".equals("reverseString")) {\n             char[] arr = (char[])parsedArgs[0];\n             StringBuilder sb = new StringBuilder("[");\n             for(int i=0; i<arr.length; i++) {\n                 sb.append("\\"").append(arr[i]).append("\\"");\n                 if(i < arr.length-1) sb.append(",");\n             }\n             sb.append("]");\n             System.out.println(sb.toString());\n        }\n        else if (res != null) {\n            if (res instanceof int[]) System.out.println(Arrays.toString((int[])res).replaceAll(" ", ""));\n            else if (res instanceof Object[]) System.out.println(Arrays.toString((Object[])res).replaceAll(" ", ""));\n            else if (res instanceof List) {\n                 StringBuilder sb = new StringBuilder("[");\n                 List<?> list = (List<?>)res;\n                 for(int i=0; i<list.size(); i++) {\n                     Object item = list.get(i);\n                     if (item instanceof String) sb.append("\\"").append(item).append("\\"");\n                     else sb.append(item);\n                     if (i < list.size()-1) sb.append(",");\n                 }\n                 sb.append("]");\n                 System.out.println(sb.toString());\n            }\n            else if (res instanceof String) System.out.println("\\"" + res + "\\"");\n            else System.out.println(res);\n        }\n    }\n}`;
        finalCode = prelude + sourceCode + postlude;
        lineOffset = prelude.split("\n").length - 1;
      } else if (language === "cpp") {
        const prelude = `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n#include <type_traits>\n#include <algorithm>\n\nusing namespace std;\n\n`;
        let callLogic = "";
        if (entryPoint === "twoSum") {
          callLogic = `if (inputs.size() >= 2) { auto arg0 = parseArg<vector<int>>(inputs[0]); auto arg1 = parseArg<int>(inputs[1]); auto res = sol.twoSum(arg0, arg1); printRes(res); }`;
        } else if (entryPoint === "reverseString") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<vector<char>>(inputs[0]); sol.reverseString(arg0); printRes(arg0); }`;
        } else if (entryPoint === "fizzBuzz") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<int>(inputs[0]); auto res = sol.fizzBuzz(arg0); printRes(res); }`;
        } else if (entryPoint === "longestCommonPrefix") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<vector<string>>(inputs[0]); auto res = sol.longestCommonPrefix(arg0); printRes(res); }`;
        } else if (entryPoint === "isPalindrome") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<string>(inputs[0]); auto res = sol.isPalindrome(arg0); printRes(res); }`;
        } else if (entryPoint === "isValid") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<string>(inputs[0]); auto res = sol.isValid(arg0); printRes(res); }`;
        } else if (entryPoint === "fib") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<int>(inputs[0]); auto res = sol.fib(arg0); printRes(res); }`;
        } else if (entryPoint === "findMax") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<vector<int>>(inputs[0]); auto res = sol.findMax(arg0); printRes(res); }`;
        } else if (entryPoint === "search") {
          callLogic = `if (inputs.size() >= 2) { auto arg0 = parseArg<vector<int>>(inputs[0]); auto arg1 = parseArg<int>(inputs[1]); auto res = sol.search(arg0, arg1); printRes(res); }`;
        } else if (entryPoint === "maxArea") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<vector<int>>(inputs[0]); auto res = sol.maxArea(arg0); printRes(res); }`;
        } else if (entryPoint === "trap") {
          callLogic = `if (inputs.size() >= 1) { auto arg0 = parseArg<vector<int>>(inputs[0]); auto res = sol.trap(arg0); printRes(res); }`;
        }
        const postlude = `\n\n// --- WRAPPER ---\ntemplate <typename T> T parseArg(const string& str) { if constexpr (is_same_v<T, int>) { return stoi(str); } else if constexpr (is_same_v<T, string>) { string s = str; if (s.size() >= 2 && s.front() == '"' && s.back() == '"') s = s.substr(1, s.size() - 2); return s; } else if constexpr (is_same_v<T, vector<int>>) { vector<int> res; string s = str; if (s.size() >= 2 && s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2); stringstream ss(s); string item; while (getline(ss, item, ',')) res.push_back(stoi(item)); return res; } else if constexpr (is_same_v<T, vector<string>>) { vector<string> res; string s = str; if (s.size() >= 2 && s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2); stringstream ss(s); string item; while (getline(ss, item, ',')) { size_t start = item.find_first_not_of(" \\""); size_t end = item.find_last_not_of(" \\""); if (start != string::npos && end != string::npos) res.push_back(item.substr(start, end - start + 1)); } return res; } else if constexpr (is_same_v<T, vector<char>>) { vector<char> res; string s = str; if (s.size() >= 2 && s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2); stringstream ss(s); string item; while (getline(ss, item, ',')) { size_t start = item.find_first_not_of(" \\""); if (start != string::npos) res.push_back(item[start]); } return res; } return T{}; }\nvoid printRes(int res) { cout << res << endl; } void printRes(const string& res) { cout << "\\"" << res << "\\"" << endl; } void printRes(const vector<int>& res) { cout << "["; for (size_t i = 0; i < res.size(); ++i) cout << res[i] << (i < res.size() - 1 ? "," : ""); cout << "]" << endl; } void printRes(const vector<string>& res) { cout << "["; for (size_t i = 0; i < res.size(); ++i) cout << "\\"" << res[i] << "\\"" << (i < res.size() - 1 ? "," : ""); cout << "]" << endl; } void printRes(const vector<char>& res) { cout << "["; for (size_t i = 0; i < res.size(); ++i) cout << "\\"" << res[i] << "\\"" << (i < res.size() - 1 ? "," : ""); cout << "]" << endl; }\nint main() { vector<string> inputs; string line; while (getline(cin, line)) { if (!line.empty()) { if (line.back() == '\\r') line.pop_back(); inputs.push_back(line); } } if (inputs.empty()) return 0; Solution sol; ${callLogic} return 0; }\n`;
        finalCode = prelude + sourceCode + postlude;
        lineOffset = prelude.split("\n").length - 1;
      }
    }

    const codePath = path.join(tmpDir, config.filename);
    fs.writeFileSync(codePath, finalCode, "utf8");

    const stdinPath = path.join(tmpDir, "stdin.txt");
    fs.writeFileSync(stdinPath, stdin || "", "utf8");

    // Convert Windows path to Docker-compatible path
    const mountPathRaw = tmpDir.replace(/\\/g, "/");
    const mountPath = mountPathRaw.startsWith("/") ? mountPathRaw : "/" + mountPathRaw.replace(/^([a-zA-Z]):/, "$1");

    const dockerArgs = [
      "run", "--rm", "--network=none", "--memory=128m", "--cpus=0.5", "--pids-limit=64", "--read-only",
      "--tmpfs", "/tmp:rw,exec,nosuid,size=64m", "-v", mountPath + ":/code:ro", "-i",
      config.image, ...config.cmd(config.filename)
    ];

    const startTime = Date.now();
    return await new Promise((resolve) => {
      const child = execFile("docker", dockerArgs, { timeout: EXEC_TIMEOUT, maxBuffer: 1024*1024, windowsHide: true }, (error, stdout, stderr) => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(3);
        if (error) {
          const combinedErr = (stderr || "").trim();
          const isCompileError = combinedErr.includes("error:") && (combinedErr.includes("javac") || combinedErr.includes("g++") || combinedErr.includes("SyntaxError"));
          resolve({
            stdout: (stdout || "").trim(),
            stderr: combinedErr,
            compile_output: isCompileError ? combinedErr : "",
            status: { id: isCompileError ? 6 : 11, description: isCompileError ? "Compilation Error" : "Runtime Error" },
            time: elapsed,
            memory: null,
            lineOffset // New field
          });
          return;
        }
        resolve({
          stdout: (stdout || "").trim(),
          stderr: (stderr || "").trim(),
          compile_output: "",
          status: { id: 3, description: "Accepted" },
          time: elapsed,
          memory: null,
          lineOffset // New field
        });
      });
      if (stdin) child.stdin.write(stdin);
      child.stdin.end();
    });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
}

module.exports = { executeCode, LANG_CONFIG };
