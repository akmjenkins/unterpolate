import { to, from } from '../src';

describe('unterpolate', () => {
  it('should in/unterpolate using a string', () => {
    const template = '{year}-{month}-{day}';
    const interpolated = '2019-10-01';
    const expected = {
      year: '2019',
      month: '10',
      day: '01',
    };

    expect(to(template, interpolated)).toMatchObject(expected);
    expect(from(template, expected)).toBe(interpolated);
  });

  it('should in/unterpolate using an array', () => {
    const template = [
      '{first.second}',
      '{second}',
      'third-{fourth.fifth}',
      '{first.first}',
    ];
    const interpolated = ['joe', 'bill', 'third-jim', ['tom', 'dick', 'harry']];
    const expected = {
      first: {
        first: ['tom', 'dick', 'harry'],
        second: 'joe',
      },
      fourth: {
        fifth: 'jim',
      },
      second: 'bill',
    };

    expect(to(template, interpolated)).toMatchObject(expected);
    expect(from(template, expected)).toMatchObject(interpolated);
  });

  it('should in/unterpolate using a function', () => {
    const template = {
      first: (val, opts) =>
        opts.how === 'to' ? { prop: val / 2 } : val['prop'] * 2,
    };

    const value = {
      first: 20,
    };

    const expected = {
      prop: 10,
    };

    expect(to(template, value)).toMatchObject(expected);
    expect(from(template, expected)).toMatchObject(value);
  });

  it('should in/unterpolate using an object', () => {
    const template = {
      first: '{first.second}',
      second: '{second}',
      third: '{first.childA.0}',
      fourth: ['{a}', 'b', '{c}'],
    };

    const interpolated = {
      first: 'joe',
      second: 'bill',
      third: ['tom', 'dick', 'harry'],
      fourth: ['jim', 'b', 'fred'],
    };

    const expected = {
      a: 'jim',
      c: 'fred',
      first: {
        second: 'joe',
        childA: [['tom', 'dick', 'harry']],
      },
      second: 'bill',
    };

    expect(to(template, interpolated)).toMatchObject(expected);
    expect(from(template, expected)).toMatchObject(interpolated);
  });

  it('should throw an error if multiple interpolations are at a non-string value path', () => {
    const template = '{joe}-{bill}';
    const interpolated = ['first', 'second'];
    expect(() => to(template, interpolated)).toThrow();
  });
});
