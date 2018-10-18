"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
// The Firebase Admin SDK to access the Firebase Realtime Database.
admin.initializeApp();
// Keeps track of the length of the 'likes' child list in a separate property.
exports.countTrade = functions.database.ref('/trades/{tradeid}').onWrite((change) => __awaiter(this, void 0, void 0, function* () {
    //   const collectionRef = change.after.ref.parent;
    const countRef = admin.database().ref('/constants/trades_count');
    let increment;
    if (change.after.exists() && !change.before.exists()) {
        increment = 1;
    }
    else if (!change.after.exists() && change.before.exists()) {
        increment = -1;
    }
    else {
        return null;
    }
    // Return the promise from countRef.transaction() so our function
    // waits for this async event to complete before it exits.
    yield countRef.transaction((current) => {
        return (current || 0) + increment;
    });
    console.log('Counter updated.');
    return null;
}));
// If the number of likes gets deleted, recount the number of likes
exports.recountTrades = functions.database.ref('/constants/trades_count').onDelete((snap) => __awaiter(this, void 0, void 0, function* () {
    const counterRef = snap.ref;
    const collectionRef = counterRef.parent;
    // Return the promise from counterRef.set() so our function
    // waits for this async event to complete before it exits.
    return collectionRef.once('value').then((messagesData) => {
        return counterRef.set(messagesData.numChildren());
    });
}));
exports.countOffering = functions.database.ref('/users/{userid}/videogames/offer/{gameid}').onWrite((change) => __awaiter(this, void 0, void 0, function* () {
    const game = change.after.val();
    const key = change.after.key;
    let increment;
    if (change.after.exists() && !change.before.exists()) {
        increment = 1;
    }
    else if (!change.after.exists() && change.before.exists()) {
        increment = -1;
    }
    else {
        return null;
    }
    // Return the promise from countRef.transaction() so our function
    // waits for this async event to complete before it exits.
    yield admin.database().ref('/videogames/' + game.platformId + '/' + key + '/offering_count').transaction((current) => {
        return (current || 0) + increment;
    });
    console.log('Counter updated.');
    return null;
}));
//# sourceMappingURL=index.js.map