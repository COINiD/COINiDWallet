var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

var randomBytes = require('randombytes');

import { encryptPrivateSalt } from '../config/secrets';

export const encrypt = (text, password, encoding, usePublicSalt, usePrivateSalt) => {
  usePublicSalt = (usePublicSalt === undefined) ? true : usePublicSalt;
  usePrivateSalt = (usePrivateSalt === undefined) ? true : usePrivateSalt;

  var publicSalt = '';
  if(usePublicSalt) {
    publicSalt = randomBytes(16 / 2).toString('hex');
  }

  var privateSalt = '';
  if(usePrivateSalt) {
    privateSalt = encryptPrivateSalt;
  }

  var saltedPassword = publicSalt + password + privateSalt;

  text = publicSalt+text; // for verification of correct decryption

  var cipher = crypto.createCipher(algorithm, saltedPassword)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  
  var encrypted = publicSalt+crypted;

  if(encoding !== undefined) {
    return new Buffer(encrypted, 'hex').toString(encoding);
  }

  return encrypted;
}

export const decrypt = (encrypted, password, encoding, usePublicSalt, usePrivateSalt) => {
  usePublicSalt = (usePublicSalt === undefined) ? true : usePublicSalt;
  usePrivateSalt = (usePrivateSalt === undefined) ? true : usePrivateSalt;

  if(encoding !== undefined && encoding !== 'hex') {
    encrypted = new Buffer(encrypted, encoding).toString('hex'); // convert from encoding to hex
  }

  var publicSalt = '';
  if(usePublicSalt) {
    publicSalt = encrypted.substr(0, 16);
    encrypted = encrypted.substr(16);
  }

  var privateSalt = '';
  if(usePrivateSalt) {
    privateSalt = encryptPrivateSalt;
  }

  var saltedPassword = publicSalt + password + privateSalt;


  var decipher = crypto.createDecipher(algorithm, saltedPassword);
  var text = decipher.update(encrypted,'hex','utf8');
  text += decipher.final('utf8');

  if(text.substr(0, publicSalt.length) === publicSalt) {
    return text.slice(publicSalt.length);
  }
  else {
    throw('Error decrypting data, wrong password?');
  }
}

export const randomLimited = (howMany, chars) => {
  chars = chars || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
  var rnd = randomBytes(howMany)
      , value = new Array(howMany)
      , len = chars.length;

  for (var i = 0; i < howMany; i++) {
      value[i] = chars[rnd[i] % len]
  };

  return value.join('');
}