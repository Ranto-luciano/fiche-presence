const { execSync } = require("child_process");

const msg = process.env.npm_config_msg || "maj";

execSync("npm run build", { stdio: "inherit" });
execSync("git add .", { stdio: "inherit" });
execSync(`git commit -m "${msg}"`, { stdio: "inherit" });
execSync("git push", { stdio: "inherit" });
execSync("npx vercel --prod", { stdio: "inherit" });