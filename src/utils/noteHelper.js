

/**
 * Helper for storing and retrieving notes.
 */

import { EventEmitter } from 'events';
import storageHelper from './storageHelper';

const md5 = require('md5');

class NoteHelper extends EventEmitter {
  constructor(baseKey) {
    super();
    this.baseKey = baseKey;
    this.storage = storageHelper(`${baseKey}-notes`);
    this.cache = {};
  }

  getBaseKey = () => this.baseKey

  getKey = (tx, address) => md5(tx.uniqueHash + address)

  saveNotes = (tx, batchedTransactions) => {
    const p = batchedTransactions.map(({ address, note }) => this.saveNote(tx, address, note));
    return Promise.all(p);
  }

  loadNotes = (tx) => {
    const otherVouts = tx.vout;
    const p = otherVouts.map(({ addr }) => this.loadNote(tx, addr));
    const promise = Promise.all(p)
      .then(notesArr => new Map(notesArr.map((note, i) => [otherVouts[i].addr, note])));

    return promise;
  }

  saveNote = (tx, address, note = '') => {
    const key = this.getKey(tx, address);

    this.cache[key] = note;

    return this.storage.set(key, note).then(() => {
      this.emit('savednote', tx, address, note);
    });
  }

  getCachedNote = (tx, address) => {
    const key = this.getKey(tx, address);

    if (this.cache[key] !== undefined && this.cache[key] !== null) {
      return this.cache[key];
    }
    return '';
  }

  loadNote = (tx, address) => {
    const key = this.getKey(tx, address);

    return new Promise((resolve) => {
      if (this.cache[key] !== undefined && this.cache[key] !== null) {
        return resolve(this.cache[key]);
      }

      return this.storage.get(key).then(note => resolve(note));
    }).then((note) => {
      if (note !== undefined && note !== null) {
        this.cache[key] = note;
      }
      return note;
    });
  }
}

const NoteHelpersCache = {}; // for local caching so we dont create several for same baseKey.

module.exports = (baseKey) => {
  if (NoteHelpersCache[baseKey] === undefined) {
    NoteHelpersCache[baseKey] = new NoteHelper(baseKey);
  }

  return NoteHelpersCache[baseKey];
};
