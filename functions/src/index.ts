import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access the Firebase Realtime Database.
admin.initializeApp();

// Keeps track of the length of the 'likes' child list in a separate property.
export const countTrade = functions.database.ref('/trades/{tradeid}').onWrite(
    async (change) => {
    //   const collectionRef = change.after.ref.parent;
      const countRef = admin.database().ref('/constants/trades_count');

      let increment;
      if (change.after.exists() && !change.before.exists()) {
        increment = 1;
      } else if (!change.after.exists() && change.before.exists()) {
        increment = -1;
      } else {
        return null;
      }

      // Return the promise from countRef.transaction() so our function
      // waits for this async event to complete before it exits.
      await countRef.transaction((current) => {
        return (current || 0) + increment;
      });
      console.log('Counter updated.');
      return null;
    });

// If the number of likes gets deleted, recount the number of likes
export const recountTrades = functions.database.ref('/constants/trades_count').onDelete(async (snap) => {
    const counterRef = snap.ref;
    const collectionRef = counterRef.parent;
  
    // Return the promise from counterRef.set() so our function
    // waits for this async event to complete before it exits.
    return collectionRef.once('value').then((messagesData) =>{
        return counterRef.set(messagesData.numChildren());
    })
  });

export const countOffering = functions.database.ref('/users/{userid}/videogames/offer/{gameid}').onWrite(
  async (change) => {

    const game = change.after.val();
    const key = change.after.key;
    let increment;
    if (change.after.exists() && !change.before.exists()) {
      increment = 1;
    }else if (!change.after.exists() && change.before.exists()) {
      increment = -1;
    } else {
      return null;
    }
    // Return the promise from countRef.transaction() so our function
      // waits for this async event to complete before it exits.
      await admin.database().ref('/videogames/'+game.platformId+'/'+key+'/offering_count').transaction((current) => {
        return (current || 0) + increment;
      });
      console.log('Counter updated.');
      return null;
  }
)
