import typescript from "@rollup/plugin-typescript";

export default {
  output: {
    dir: "output",
    format: "es",
  },
  plugins: [typescript()],
};
