// 简易解密逻辑：凯撒密码（位移替换）。
// 指挥终端随机给出一段密文与位移量，值守主管需输入位移后的明文完成授权。

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PLAIN_WORDS = [
  'RAPTOR',
  'SECURE',
  'ISLAND',
  'GATE09',
  'TREX42',
  'LOCKDN',
  'PERIMT',
  'RESCUE',
  'ALPHA7',
  'DELTA3',
];

function shiftChar(ch, shift) {
  const idx = ALPHABET.indexOf(ch);
  if (idx === -1) return ch;
  return ALPHABET[(idx + shift) % 26];
}

function encode(word, shift) {
  return word.split('').map((ch) => shiftChar(ch, shift)).join('');
}

// 生成一道解密题：已知密文与位移量，求原文
export function generateCipherChallenge() {
  const word = PLAIN_WORDS[Math.floor(Math.random() * PLAIN_WORDS.length)];
  const shift = 3 + Math.floor(Math.random() * 7); // 位移量 3~9
  return {
    cipher: encode(word, shift),
    shift,
    answer: word,
  };
}

export function normalizeAnswer(value) {
  return value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}
