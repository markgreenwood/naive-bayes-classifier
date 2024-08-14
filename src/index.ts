export function fileName() {
  const theError = new Error("here I am");
  return theError.stack?.match(/\/(\w+\.ts):/)?.[1] ?? "";
}

export function welcomeMessage() {
  return `Welcome to ${fileName()}`;
}

export class Classifier {
  labelCounts: Map<string, number>;
  labelProbabilities: Map<string, number>;
  smoothing: number;
  songList: {
    difficulties: string[];
    songs: SongListSong[];
    allChords: Set<string>;
    addSong: (name: string, chords: string[], difficulty: number) => void;
  };

  constructor() {
    this.labelCounts = new Map();
    this.labelProbabilities = new Map();
    this.smoothing = 1.01;
    this.songList = {
      difficulties: ["easy", "medium", "hard"],
      songs: [] as SongListSong[],
      allChords: new Set(),
      addSong(name: string, chords: string[], difficulty: number) {
        this.songs.push({
          name,
          chords,
          difficulty: this.difficulties[difficulty],
        });
      },
    };
  }

  addSong(name: string, chords: string[], difficulty: number) {
    this.songList.addSong(name, chords, difficulty);
  }

  trainAll() {
    this.songList.songs.forEach((song) => {
      this.train(song.chords, song.difficulty);
    });
    this.setLabelProbabilities();
  }

  train(chords, label) {
    chords.forEach((chord) => this.songList.allChords.add(chord));

    if (Array.from(this.labelCounts.keys()).includes(label)) {
      this.labelCounts.set(label, this.labelCounts.get(label)! + 1);
    } else {
      this.labelCounts.set(label, 1);
    }
  }

  setLabelProbabilities() {
    classifier.labelCounts.forEach((_count, label) => {
      classifier.labelProbabilities.set(
        label,
        classifier.labelCounts.get(label)! / this.songList.songs.length,
      );
    });
  }

  likelihoodFromChord(difficulty: string, chord: string) {
    return (
      this.chordCountForDifficulty(difficulty, chord) /
      this.songList.songs.length
    );
  }

  valueForChordDifficulty(difficulty: string, chord: string) {
    const value = this.likelihoodFromChord(difficulty, chord);
    return value ? value + this.smoothing : 1;
  }

  chordCountForDifficulty(difficulty: string, testChord: string) {
    return this.songList.songs.reduce((counter, song) => {
      if (song.difficulty === difficulty) {
        counter += song.chords.filter((chord) => chord === testChord).length;
      }
      return counter;
    }, 0);
  }

  classify(chords: string[]) {
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
              this.labelProbabilities.get(difficulty)! + this.smoothing,
            ),
          ];
        },
      ),
    );
  }
}

export const classifier = new Classifier();

type SongListSong = { name: string; chords: string[]; difficulty: string };
