"use strict"

/**
 * Helper for storing and retrieving notes.
 */

import { EventEmitter } from 'events';
import storageHelper from './storageHelper';
const md5 = require('md5');

class NoteHelper extends EventEmitter {

  constructor(coin) {
    super();
    this.storage = storageHelper(coin+'-notes');
    this.cache = {};
  }

  getKey = (tx, address) => {
    return md5(tx.uniqueHash+address);
  }

  saveNotes = (tx, batchedTransactions) => {
    let p = batchedTransactions.map(({address, note}) => this.saveNote(tx, address, note));
    return Promise.all(p);
  }

  loadNotes = (tx) => {
    let otherVouts = tx.vout;
    let p = otherVouts.map(({addr}) => this.loadNote(tx, addr));

    return Promise.all(p).then((notesArr) => {
      return new Map(notesArr.map((note, i) => [otherVouts[i].addr, note]));
    });
  }

  saveNote = (tx, address, note) => {
    note = note === undefined ? '' : note;

    const key = this.getKey(tx, address);

    this.cache[key] = note;

    return this.storage.set(key, note).then(() => {
      this.emit('savednote', tx, address, note);
    });
  }

  getCachedNote = (tx, address) => {
    const key = this.getKey(tx, address);

    if(this.cache[key] !== undefined && this.cache[key] !== null) {
      return this.cache[key];
    }
    return '';
  }

  loadNote = (tx, address) => {
    const key = this.getKey(tx, address);
    
    return new Promise((resolve, reject) => {
      if(this.cache[key] !== undefined && this.cache[key] !== null) {
        return resolve(this.cache[key]);
      }

      return this.storage.get(key).then(note => resolve(note));
    }).then(note => {
      if(note !== undefined && note !== null) {
        this.cache[key] = note;
        return note;
      }
    });
  }
}

let NoteHelpersCache = {}; // for local caching so we dont create several for same coin.

module.exports = function(coin) {
  if(NoteHelpersCache[coin] === undefined) {
    NoteHelpersCache[coin] = new NoteHelper(coin);
  }

  return NoteHelpersCache[coin];
}