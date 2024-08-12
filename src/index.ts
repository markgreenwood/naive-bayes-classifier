const easy = "easy";
const medium = "medium";
const hard = "hard";

const imagine = ["c", "cmaj7", "f", "am", "dm", "g", "e7"];
const somewhereOverTheRainbow = ["c", "em", "f", "g", "am"];
const tooManyCooks = ["c", "g", "f"];
const iWillFollowYouIntoTheDark = ["f", "dm", "bb", "c", "a", "bbm"];
const babyOneMoreTime = ["cm", "g", "bb", "eb", "fm", "ab"];
const creep = ["g", "gsus4", "b", "bsus4", "c", "cmsus4", "cm6"];
const paperBag = [
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
];
const toxic = ["cm", "eb", "g", "cdim", "eb7", "d7", "db7", "ab", "gmaj7"];
const bulletproof = ["d#m", "g#", "b", "f#", "g#m", "c#"];

type Song = { label: string; chords: string[] };
const songs: Song[] = [];
const allChords = new Set();
const labelCounts = new Map();
const labelProbabilities = new Map();
const chordCountsInLabels = new Map();
let probabilityOfChordsInLabels = new Map();

function train(chords, label) {
  songs.push({ label, chords });
  chords.forEach((chord) => allChords.add(chord));

  if (Array.from(labelCounts.keys()).includes(label)) {
    labelCounts.set(label, labelCounts.get(label) + 1);
  } else {
    labelCounts.set(label, 1);
  }
}

function setLabelProbabilities() {
  labelCounts.forEach(function (_count, label) {
    labelProbabilities.set(label, labelCounts.get(label) / songs.length);
  });
}

function setChordCountsInLabels() {
  songs.forEach(function (song) {
    if (chordCountsInLabels.get(song.label) === undefined) {
      chordCountsInLabels.set(song.label, {});
    }
    song.chords.forEach(function (chord) {
      if (chordCountsInLabels.get(song.label)[chord] > 0) {
        chordCountsInLabels.get(song.label)[chord] += 1;
      } else {
        chordCountsInLabels.get(song.label)[chord] = 1;
      }
    });
  });
}

function setProbabilityOfChordsInLabels() {
  probabilityOfChordsInLabels = chordCountsInLabels;
  probabilityOfChordsInLabels.forEach(function (_chords, difficulty) {
    Object.keys(probabilityOfChordsInLabels.get(difficulty)).forEach(
      function (chord) {
        probabilityOfChordsInLabels.get(difficulty)[chord] /= songs.length;
      },
    );
  });
}

train(imagine, easy);
train(somewhereOverTheRainbow, easy);
train(tooManyCooks, easy);
train(iWillFollowYouIntoTheDark, medium);
train(babyOneMoreTime, medium);
train(creep, medium);
train(paperBag, hard);
train(toxic, hard);
train(bulletproof, hard);

setLabelProbabilities();
setChordCountsInLabels();
setProbabilityOfChordsInLabels();

export function classify(chords) {
  const smoothing = 1.01;
  console.log(labelProbabilities);
  const classified = new Map();
  labelProbabilities.forEach(function (_probabilities, difficulty) {
    let first = labelProbabilities.get(difficulty) + smoothing;
    chords.forEach(function (chord) {
      const probabilityOfChordInLabel =
        probabilityOfChordsInLabels.get(difficulty)[chord];
      if (probabilityOfChordInLabel) {
        first = first * (probabilityOfChordInLabel + smoothing);
      }
    });
    classified.set(difficulty, first);
  });
  return classified;
}

classify(["d", "g", "e", "dm"]);
classify(["f#m7", "a", "dadd9", "dmaj7", "bm", "bm7", "d", "f#m"]);
