import { classify, labelProbabilities, welcomeMessage } from "../src";

describe("welcomeMessage", () => {
  it("returns a welcome message", () => {
    expect(welcomeMessage()).toEqual("Welcome to index.ts");
  });
});

describe("labelProbabilities", () => {
  it("are correct", () => {
    expect(labelProbabilities.get("easy")).toEqual(0.3333333333333333);
    expect(labelProbabilities.get("medium")).toEqual(0.3333333333333333);
    expect(labelProbabilities.get("hard")).toEqual(0.3333333333333333);
  });
});

describe("classify", () => {
  it("classifies", () => {
    const classified = classify([
      "f#m7",
      "a",
      "dadd9",
      "dmaj7",
      "bm",
      "bm7",
      "d",
      "f#m",
    ]);
    expect(classified.get("easy")).toEqual(1.3433333333333333);
    expect(classified.get("medium")).toEqual(1.5060259259259259);
    expect(classified.get("hard")).toEqual(1.6884223991769547);
  });

  it("classifies again", () => {
    const classified = classify(["d", "g", "e", "dm"]);
    expect(classified.get("easy")).toEqual(2.023094827160494);
    expect(classified.get("medium")).toEqual(1.855758613168724);
    expect(classified.get("hard")).toEqual(1.855758613168724);
  });
});
