import * as esbuild from "esbuild";
import { match } from "ts-pattern";
import { join, dirname } from "node:path";
import copy from "recursive-copy";
import { platform, homedir } from "node:os";
import { readFile, rm, mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Roughly https://github.com/demurgos/appdata-path/blob/master/lib/index.js but appdata local and .local/share, try to match `dirs` from rust
function getAppDataLocalPath() {
  const identifier = "com.ironcladapp.rivet";
  return match(platform())
    .with("win32", () => join(homedir(), "AppData", "Local", identifier))
    .with("darwin", () =>
      join(homedir(), "Library", "Application Support", identifier)
    )
    .with("linux", () => join(homedir(), ".local", "share", identifier))
    .otherwise(() => {
      if (platform().startsWith("win")) {
        return join(homedir(), "AppData", "Local", identifier);
      } else {
        return join(homedir(), ".local", "share", identifier);
      }
    });
}

const syncPlugin: esbuild.Plugin = {
  name: "onBuild",
  setup(build) {
    build.onEnd(async () => {
      const packageJson = JSON.parse(
        await readFile(join(__dirname, "package.json"), "utf-8")
      );
      const pluginName = packageJson.name;

      const rivetPluginsDirectory = join(getAppDataLocalPath(), "plugins");
      const thisPluginDirectory = join(
        rivetPluginsDirectory,
        `${pluginName}-latest`
      );

      await rm(join(thisPluginDirectory, "package"), {
        recursive: true,
        force: true,
      });
      await mkdir(join(thisPluginDirectory, "package"), { recursive: true });

      await copy(
        join(__dirname, "dist"),
        join(thisPluginDirectory, "package", "dist")
      );
      await copyFile(
        join(__dirname, "package.json"),
        join(thisPluginDirectory, "package", "package.json")
      );

      // Copy .git to mark as locally installed plugin
      await copy(
        join(__dirname, ".git"),
        join(thisPluginDirectory, "package", ".git")
      );

      console.log(
        `Synced ${pluginName} to Rivet at ${thisPluginDirectory}. Refresh or restart Rivet to see changes.`
      );
    });
  },
};

const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "neutral",
  target: "es2020",
  outfile: "dist/bundle.js",
  format: "esm",
  logLevel: "info",
  plugins: [] as esbuild.Plugin[],
} satisfies esbuild.BuildOptions;

if (process.argv.includes("--sync")) {
  options.plugins.push(syncPlugin);
}

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(options);

  await context.watch();

  console.log("Watching for changes...");
} else {
  await esbuild.build(options);
}
