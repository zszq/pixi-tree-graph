import pkg from "./package.json";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import visualizer from "rollup-plugin-visualizer";

const getIPAdress = () => {
  let interfaces = require("os").networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
};

const bundle = (format, filename, options = {}) => ({
  input: "src/index.ts",
  output: {
    file: filename,
    format: format,
    name: "PixiTree",
    sourcemap: true,
  },
  // external: [
  //   ...Object.keys(pkg.peerDependencies),
  //   ...(!options.resolve ? Object.keys(pkg.dependencies) : []),
  // ],
  plugins: [
    ...(options.resolve ? [nodeResolve({ preferBuiltins: false })] : []),
    commonjs(),
    typescript({ typescript: require("typescript"), tsconfig: "./tsconfig.json" }),
    ...(options.minimize ? [terser()] : []),
    ...(process.env.NODE_ENV === 'development' ? [
      serve({
        // open: true,
        // openPage: '/demo/',
        contentBase: [""],
        host: getIPAdress(),
        // port: 10001,
      }),
      livereload({ watch: "dist" })
    ] : []),
    ...(options.stats ? [visualizer({ filename: filename + ".stats.html" })] : [])
  ],
});

export default [
  // bundle('cjs', pkg.main),
  // bundle('es', pkg.module),
  bundle("umd", pkg.browser.replace(".min", ""), { resolve: true, stats: true, }),
  // bundle('umd', pkg.browser, { resolve: true, minimize: true }),
  // {
  //   input: 'src/index.ts',
  //   output: {
  //     file: pkg.types,
  //     format: 'es',
  //   },
  //   plugins: [
  //     dts(),
  //   ],
  // },
];
