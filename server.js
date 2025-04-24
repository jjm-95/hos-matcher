const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// 실행 파일 경로
const basePath = path.dirname(process.execPath);

// Next.js 빌드 파일 경로
const buildPath = path.join(basePath, ".next");

// 빌드 파일이 없으면 에러 처리
if (!fs.existsSync(buildPath)) {
  console.error("Error: .next directory not found. Please ensure it is in the same directory as the executable.");
  process.exit(1);
}

// Next.js 서버 실행
const server = exec("npm run start", { cwd: basePath });

// 브라우저 자동 실행
server.stdout.on("data", (data) => {
  console.log(data);
  if (data.includes("http://localhost:3000")) {
    // 브라우저 열기 (Windows 환경)
    exec("start http://localhost:3000");
  }
});

server.stderr.on("data", (data) => {
  console.error(data);
});