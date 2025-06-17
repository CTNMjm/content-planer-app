#!/usr/bin/env node
console.log("Starting Next.js application...");
require("child_process").spawn("npm", ["run", "start"], {
  stdio: "inherit",
  env: process.env
});
