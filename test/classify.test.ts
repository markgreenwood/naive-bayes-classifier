import { classifier, welcomeMessage } from "../src";

describe("welcomeMessage", () => {
  it("returns a welcome message", () => {
    expect(welcomeMessage()).toEqual("Welcome to index.ts");
  });
});

describe("labelProbabilities", () => {
  it("are correct", () => {
    expect(classifier.labelProbabilities.get("easy")).toEqual(
      0.3333333333333333,
    );
    expect(classifier.labelProbabilities.get("medium")).toEqual(
      0.3333333333333333,
    );
    expect(classifier.labelProbabilities.get("hard")).toEqual(
      0.3333333333333333,
    );
  });
});

describe("classify", () => {
  classifier.songList.addSong(
    "imagine",
    ["c", "cmaj7", "f", "am", "dm", "g", "e7"],
    0,
  );
  classifier.songList.addSong(
    "somewhereOverTheRainbow",
    ["c", "em", "f", "g", "am"],
    0,
  );
  classifier.songList.addSong("tooManyCooks", ["c", "g", "f"], 0);
  classifier.songList.addSong(
    "iWillFollowYouIntoTheDark",
    ["f", "dm", "bb", "c", "a", "bbm"],
    1,
  );
  classifier.songList.addSong(
    "babyOneMoreTime",
    ["cm", "g", "bb", "eb", "fm", "ab"],
    1,
  );
  classifier.songList.addSong(
    "creep",
    ["g", "gsus4", "b", "bsus4", "c", "cmsus4", "cm6"],
    1,
  );
  classifier.songList.addSong(
    "paperBag",
    [
      "bm7",
      "e",
      "c",
      "g",
      "b7",
      "f",
      "em",
      "a",
      "cmaj7",
      "em7",
      "a7",
      "f7",
      "b",
    ],
    2,
  );
  classifier.songList.addSong(
    "toxic",
    ["cm", "eb", "g", "cdim", "eb7", "d7", "db7", "ab", "gmaj7"],
    2,
  );
  classifier.songList.addSong(
    "bulletproof",
    ["d#m", "g#", "b", "f#", "g#m", "c#"],
    2,
  );
  classifier.trainAll();

  it("classifies", () => {
    const classified = classifier.classify([
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
    const classified = classifier.classify(["d", "g", "e", "dm"]);
    expect(classified.get("easy")).toEqual(2.023094827160494);
    expect(classified.get("medium")).toEqual(1.855758613168724);
    expect(classified.get("hard")).toEqual(1.855758613168724);
  });
});
