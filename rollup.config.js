import fs from "fs";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

const pkg = JSON.parse(fs.readFileSync("./package.json"));

export default {
  input: "src/feedback.ts",
  output: [
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({ compilerOptions: { lib: ["es6", "dom"], target: "es6" } }),
    copy({
      targets: [
        { src: "src/feedback.css", dest: "dist", rename: "feedback.css" },
      ],
    }),
  ],
};
