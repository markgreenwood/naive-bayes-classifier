import {classify} from '../src';

describe('Basic test', () => {
  it('should pass', () => {
    expect(1 + 1).toEqual(2);
  });

  it('classifies', () => {
    const classified = classify(['f#m7', 'a', 'dadd9', 'dmaj7', 'bm', 'bm7', 'd', 'f#m']);
    expect(classified.get('easy')).toEqual(1.3433333333333333);
    expect(classified.get('medium')).toEqual(1.5060259259259259);
    expect(classified.get('hard')).toEqual(1.6884223991769547);
  });
});