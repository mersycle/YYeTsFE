const SentryCli = require("@sentry/cli");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");

async function createReleaseAndUpload() {
  const date = new Date();
  const release = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} `;

  const cli = new SentryCli();

  try {
    console.log("Creating sentry release " + release);
    await cli.releases.new(release);

    console.log("Uploading source maps");
    await cli.releases.uploadSourceMaps(release, {
      include: ["build/static/js"],
      urlPrefix: "~/static/js",
      rewrite: false,
    });

    console.log("Finalizing release");
    await cli.releases.finalize(release);

    const sourcemapPath = path.resolve("./build/static/js");
    const mapList = fs.readdirSync(sourcemapPath).filter((file) => /js.map$/.test(file));
    mapList.forEach((file) => {
      fse.removeSync(path.resolve(sourcemapPath, file));
    });

    console.log("Source maps is remove");
  } catch (e) {
    console.error("Source maps uploading failed:", e);
  }
}

createReleaseAndUpload();
