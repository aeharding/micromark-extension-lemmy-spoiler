import { micromark } from "micromark";
import { directive, directiveHtml } from "../dev/index.js";

// describe("micromark-extension-directive (core)", async function () {
//   await test("should expose the public api", async function () {
//     expect(
//       Object.keys(await import("micromark-extension-lemmy-spoiler")).sort(),
//     ).toEqual(["directive", "directiveHtml"]);
//   });
// });

describe("micromark-extension-directive (syntax, container)", () => {
  it("should support spoiler with space", () => {
    expect(micromark("::: spoiler", options())).toEqual(
      "<details><summary>spoiler</summary></details>",
    );
  });

  it("should support spoiler without space", () => {
    expect(micromark(":::spoiler", options())).toEqual(
      "<details><summary>spoiler</summary></details>",
    );
  });

  it("should support spoiler without space", () => {
    expect(
      micromark("test test\n:::spoiler\n**bold!**\n:::", options()),
    ).toEqual(
      "<p>test test</p>\n<details><summary>spoiler</summary><p><strong>bold!</strong></p>\n</details>",
    );
  });

  // it("should support prefixed containers (3)", () => {
  //   expect(micromark(" :::spoiler\n - a\n > b", options())).toEqual(
  //     "<details><summary>spoiler</summary>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</details>",
  //   );
  // });
});

function options() {
  return {
    extensions: [directive()],
    htmlExtensions: [directiveHtml()],
  };
}
