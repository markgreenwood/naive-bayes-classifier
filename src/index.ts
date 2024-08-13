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
  smoothing: 1.01,
  likelihoodFromChord: function (difficulty: string, chord: string) {
    return this.chordCountsInLabels.get(difficulty)[chord] / this.songs.length;
  },
  valueForChordDifficulty: function (difficulty: string, chord: string) {
    const value = this.likelihoodFromChord(difficulty, chord);
    return value ? value + this.smoothing : 1;
  },
  classify: function (chords: string[]) {
    return new Map(
      Array.from(this.labelProbabilities.entries()).map(
        (labelWithProbability) => {
          const difficulty = labelWithProbability[0];
          return [
            difficulty,
            chords.reduce(
              (total, chord) => {
                return total * this.valueForChordDifficulty(difficulty, chord);
              },
              this.labelProbabilities.get(difficulty) + this.smoothing,
            ),
          ];
        },
      ),
    );
  },
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

export function trainAll() {
  songList.songs.forEach(function (song) {
    train(song.chords, song.difficulty);
  });
  setLabelsAndProbabilities();
}

function setLabelsAndProbabilities() {
  setLabelProbabilities();
  setChordCountsInLabels();
}
