const fs = require("fs");
const path = require("path");

const dirs = [
  path.join(__dirname, "../src/app/dashboard/(admin)"),
  path.join(__dirname, "../src/app/dashboard/(super-admin)"),
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) return;
  const files = getAllFiles(dir);
  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let modified = false;

    // Fix res.data.data => res.data after authFetch
    if (content.includes("authFetch(") && content.includes(".data.data")) {
      content = content.replace(/\.data\.data/g, ".data");
      modified = true;
    }

    if (modified) {
      console.log("Fixed .data in:", file);
      fs.writeFileSync(file, content, "utf8");
    }
  });
});

console.log("Done fixing .data in response objects.");
