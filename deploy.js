//
// use: $node deploy.js tag
//

const execSync = require("child_process").execSync;
const fs = require("fs");

if (process.argv.length !== 3) {
  console.log("Invalid argument");
  console.log("Usage: $node deploy.js tsg");
  return;
}

// Project名及び、アカウントIDは、cdk.jsonから取得する
const cdkJson = JSON.parse(fs.readFileSync("cdk/cdk.json"));
const projectName = cdkJson["context"]["projectName"];
const accountId = cdkJson["context"]["accountId"];
if (!projectName || !accountId) {
  console.log("projectName,accountId is not found in cdk.json");
  return;
}
// タグは、引数から取得する（最長7文字に制限する）
let tag = process.argv[2];
tag = tag.substring(0, 7);

const region = "ap-northeast-1";
console.log(`start. projectName: ${projectName} tag: ${tag} accountId: ${accountId}`);

const dockerDir = "docker";
const imageRepositoryName = `${projectName}-repo`;

exec(`docker build --platform linux/amd64 -t ${imageRepositoryName}:${tag} ${dockerDir}`);
exec(
  `docker tag ${imageRepositoryName}:${tag} ${accountId}.dkr.ecr.${region}.amazonaws.com/${imageRepositoryName}:${tag}`,
);
exec(
  `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${accountId}.dkr.ecr.${region}.amazonaws.com`,
);
exec(`docker push ${accountId}.dkr.ecr.${region}.amazonaws.com/${imageRepositoryName}:${tag}`);

console.log(`finish.`);

function exec(cmd) {
  console.log(cmd);
  execSync(cmd, { stdio: "ignore" });
}
