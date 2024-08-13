export function fileName() {
  const theError = new Error("here I am");
  return theError.stack?.match(/\/(\w+\.ts):/)?.[1] ?? "";
}

export function welcomeMessage() {
  return `Welcome to ${fileName()}`;
}

export const classifier = {
  songs: [] as Song[],
  allChords: new Set(),
  labelCounts: new Map(),
  labelProbabilities: new Map(),
  chordCountsInLabels: new Map(),
  probabilityOfChordsInLabels: new Map(),
};

export const songList = {
  difficulties: ["easy", "medium", "hard"],
  songs: [] as SongListSong[],
  addSong: function (name: string, chords: string[], difficulty: number) {
    this.songs.push({
      name,
      chords,
      difficulty: this.difficulties[difficulty],
    });
  },
};

type Song = { label: string; chords: string[] };
type SongListSong = { name: string; chords: string[]; difficulty: string };

function train(chords, label) {
  classifier.songs.push({ label, chords });
  chords.forEach((chord) => classifier.allChords.add(chord));

  if (Array.from(classifier.labelCounts.keys()).includes(label)) {
    classifier.labelCounts.set(label, classifier.labelCounts.get(label) + 1);
  } else {
    classifier.labelCounts.set(label, 1);
  }
}

function setLabelProbabilities() {
  classifier.labelCounts.forEach(function (_count, label) {
    classifier.labelProbabilities.set(
      label,
      classifier.labelCounts.get(label) / classifier.songs.length,
    );
  });
}

function setChordCountsInLabels() {
  classifier.songs.forEach(function (song) {
    if (classifier.chordCountsInLabels.get(song.label) === undefined) {
      classifier.chordCountsInLabels.set(song.label, {});
    }
    song.chords.forEach(function (chord) {
      if (classifier.chordCountsInLabels.get(song.label)[chord] > 0) {
        classifier.chordCountsInLabels.get(song.label)[chord] += 1;
      } else {
        classifier.chordCountsInLabels.get(song.label)[chord] = 1;
      }
    });
  });
}

function setProbabilityOfChordsInLabels() {
  classifier.probabilityOfChordsInLabels = classifier.chordCountsInLabels;
  classifier.probabilityOfChordsInLabels.forEach(
    function (_chords, difficulty) {
      Object.keys(
        classifier.probabilityOfChordsInLabels.get(difficulty),
      ).forEach(function (chord) {
        classifier.probabilityOfChordsInLabels.get(difficulty)[chord] /=
          classifier.songs.length;
      });
    },
  );
}

export function trainAll() {
  songList.songs.forEach(function (song) {
    train(song.chords, song.difficulty);
  });
  setLabelsAndProbabilities();
}

function setLabelsAndProbabilities() {
  setLabelProbabilities();
  setChordCountsInLabels();
  setProbabilityOfChordsInLabels();
}

export function classify(chords) {
  const smoothing = 1.01;
  const classified = new Map();
  classifier.labelProbabilities.forEach(function (_probabilities, difficulty) {
    const likelihoods = [
      classifier.labelProbabilities.get(difficulty) + smoothing,
    ];
    chords.forEach(function (chord) {
      const probabilityOfChordInLabel =
        classifier.probabilityOfChordsInLabels.get(difficulty)[chord];
      if (probabilityOfChordInLabel) {
        likelihoods.push(probabilityOfChordInLabel + smoothing);
      }
    });
    const totalLikelihood = likelihoods.reduce(function (total, index) {
      return total * index;
    });
    classified.set(difficulty, totalLikelihood);
  });
  return classified;
}
