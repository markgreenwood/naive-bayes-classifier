export function fileName() {
  const theError = new Error("here I am");
  return theError.stack?.match(/\/(\w+\.ts):/)?.[1] ?? "";
}

export function welcomeMessage() {
  return `Welcome to ${fileName()}`;
}

export const classifier = {
  labelCounts: new Map(),
  labelProbabilities: new Map(),
  smoothing: 1.01,
  songList: {
    difficulties: ["easy", "medium", "hard"],
    songs: [] as SongListSong[],
    allChords: new Set(),
    addSong: function (name: string, chords: string[], difficulty: number) {
      this.songs.push({
        name,
        chords,
        difficulty: this.difficulties[difficulty],
      });
    },
  },
  trainAll: function () {
    this.songList.songs.forEach((song) => {
      this.train(song.chords, song.difficulty);
    });
    this.setLabelProbabilities();
  },
  train: function (chords, label) {
    chords.forEach((chord) => this.songList.allChords.add(chord));

    if (Array.from(this.labelCounts.keys()).includes(label)) {
      this.labelCounts.set(label, this.labelCounts.get(label) + 1);
    } else {
      this.labelCounts.set(label, 1);
    }
  },
  setLabelProbabilities: function () {
    classifier.labelCounts.forEach((_count, label) => {
      classifier.labelProbabilities.set(
        label,
        classifier.labelCounts.get(label) / this.songList.songs.length,
      );
    });
  },
  likelihoodFromChord: function (difficulty: string, chord: string) {
    return (
      this.chordCountForDifficulty(difficulty, chord) /
      this.songList.songs.length
    );
  },
  valueForChordDifficulty: function (difficulty: string, chord: string) {
    const value = this.likelihoodFromChord(difficulty, chord);
    return value ? value + this.smoothing : 1;
  },
  chordCountForDifficulty: function (difficulty: string, testChord: string) {
    return this.songList.songs.reduce((counter, song) => {
      if (song.difficulty === difficulty) {
        counter += song.chords.filter((chord) => chord === testChord).length;
      }
      return counter;
    }, 0);
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

type SongListSong = { name: string; chords: string[]; difficulty: string };
