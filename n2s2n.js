const num2Suffix = {
  0: '',
  3: 'k',
  6: 'M',
  9: 'B',
  12: 'T',
  15: 'Qa',
  18: 'Qi',
  21: 'Sx',
  24: 'Sp',
  27: 'Oc',
  30: 'No',
  33: 'Dc',
  36: 'UnD',
};

const suffix2Num = {};
for (const [num, val] of Object.entries(num2Suffix)) {
  suffix2Num[val.toLowerCase()] = Number(num);
}

const RE = /^(?<num>\d+(\.\d*)?)(?<suffix>\w{0,2})$/;

export function n2s(num) {
  let unit = 0;
  while (num >= 10 ** (unit + 3)) {
    unit += 3;
  }
  let result = (num / 10 ** unit).toFixed(1);

  if (result.endsWith('.0')) {
    result = result.substring(0, result.length - 2);
  }

  if (result.endsWith('000')) {
    // handle smaller than thousand but rounding up
    result = result.substring(0, result.length - 3);
    unit += 3;
  }

  return result + num2Suffix[unit];
}

export function s2n(str) {
  const match = String(str).match(RE);
  if (!match) return NaN;

  const suffix = match.groups?.suffix.toLowerCase();
  if (!(suffix in suffix2Num)) return NaN;

  return Number(match.groups.num) * 10 ** suffix2Num[suffix];
}

function assert(val) {
  if (!val) throw new Error('assertion failed');
}

export function test() {
  assert(n2s(90) === '90');
  assert(n2s(90.43) === '90.4');
  assert(n2s(1000) === '1k');
  assert(n2s(1100) === '1.1k');
  assert(n2s(1490) === '1.5k');
  assert(n2s(1500) === '1.5k');
  assert(n2s(15000000000) === '15B');
  assert(n2s(999940000000) === '999.9B');
  assert(n2s(999950000000) === '1T');

  assert(s2n('10') === 10);
  assert(s2n('10k') === 10000);
  assert(s2n('99999M') === 99999000000);
  assert(s2n('10.Qa') === 10000000000000000);
  assert(s2n('10.43Qi') === 10430000000000000000);
  assert(s2n('999Qi') === 999000000000000000000);

  assert(Number.isNaN(s2n('')));
  assert(Number.isNaN(s2n('Qi')));
}

test();
