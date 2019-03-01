import { encrypt, decrypt } from '../encrypt';

describe('encrypt', () => {
  it('should return encrypted string', () => {
    const encryptedString1 = encrypt('a string to encode', 'a password', undefined, false, true);
    expect(encryptedString1).toEqual('26b3f46c13228a9bbcd01346224d2abdaa6e');
  });

  it('should return different encrypted string when public salt is used', () => {
    const encryptedString1 = encrypt('a string to encode', 'a password', undefined, true, true);
    const encryptedString2 = encrypt('a string to encode', 'a password', undefined, true, true);

    expect(encryptedString1).not.toEqual(encryptedString2);
  });

  it('should return base64 encoded encrypted string', () => {
    const encryptedString1 = encrypt('a string to encode', 'a password', 'base64', false, true);
    expect(encryptedString1).toEqual('JrP0bBMiipu80BNGIk0qvapu');
  });

  it('should return encrypted string when not using private salt', () => {
    const encryptedString1 = encrypt('a string to encode', 'a password', undefined, false, false);
    expect(encryptedString1).toEqual('e5ab2cbe320325a0fc2a5722264b0167e78c');
  });
});

describe('decrypt', () => {
  it('should return decrypted string', () => {
    const decryptedString1 = decrypt('26b3f46c13228a9bbcd01346224d2abdaa6e', 'a password', undefined, false, true);
    expect(decryptedString1).toEqual('a string to encode');
  });

  it('should return decrypted string when public salt is used', () => {
    const encryptedString1 = encrypt('a string to encode', 'a password', undefined, true, true);
    const decryptedString1 = decrypt(encryptedString1, 'a password', undefined, true, true);

    expect(decryptedString1).toEqual('a string to encode');
  });

  it('should return decrypted from base64 encoded string', () => {
    const encryptedString1 = decrypt('JrP0bBMiipu80BNGIk0qvapu', 'a password', 'base64', false, true);
    expect(encryptedString1).toEqual('a string to encode');
  });

  it('should return decrypted string when not using private salt', () => {
    const encryptedString1 = decrypt('e5ab2cbe320325a0fc2a5722264b0167e78c', 'a password', undefined, false, false);
    expect(encryptedString1).toEqual('a string to encode');
  });
});
