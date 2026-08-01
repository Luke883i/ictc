import net from 'node:net';

function privateV4(value) {
  const octets = value.split('.').map(Number);
  if (octets.length !== 4 || octets.some(item => !Number.isInteger(item) || item < 0 || item > 255)) return true;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function mappedV4(address) {
  const marker = address.lastIndexOf('ffff:');
  if (marker < 0) return null;
  const tail = address.slice(marker + 5);
  if (net.isIP(tail) === 4) return tail;
  const groups = tail.split(':');
  if (groups.length !== 2 || groups.some(group => !/^[a-f0-9]{1,4}$/i.test(group))) return null;
  const high = Number.parseInt(groups[0], 16);
  const low = Number.parseInt(groups[1], 16);
  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}

export function isPrivateAddress(value) {
  const version = net.isIP(value);
  if (version === 4) return privateV4(value);
  if (version !== 6) return true;

  const address = value.toLowerCase().split('%')[0];
  if (address === '::' || address === '::1' || address === '0:0:0:0:0:0:0:0' || address === '0:0:0:0:0:0:0:1') return true;
  const firstGroup = Number.parseInt(address.split(':')[0] || '0', 16);
  if ((firstGroup & 0xfe00) === 0xfc00) return true;
  if ((firstGroup & 0xffc0) === 0xfe80) return true;
  const mapped = mappedV4(address);
  if (mapped) return privateV4(mapped);
  if (address.includes('ffff:')) return true;
  return false;
}
