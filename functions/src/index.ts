import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const igdb = require('igdb-api-node').default;
const client = igdb('56b69359df896ff0135fe5d08e1ceaa8');
const axios = require('axios');
const body = require('body-parser');
const api_key = "56b69359df896ff0135fe5d08e1ceaa8";
import * as cors from 'cors';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';
const corsHandler = cors({origin: true});

// The Firebase Admin SDK to access the Firebase Realtime Database.
admin.initializeApp();
const db = admin.database();
const stripe = require("stripe")("sk_test_eg0NnPlE8lQ9CWyw61DISdiY");
const defaultMessaging = admin.messaging();

export const getPlatforms = functions.https.onRequest((req, res) => {
    console.log(req.body.query);
    corsHandler(req,res,() => {
      axios.get('https://api-endpoint.igdb.com/platforms/?search='+req.body.query+'&fields=*&limit=50&filter[name][prefix]='+req.body.query,{headers:{ 'user-key':api_key,'Accept':'application/json'}})
    .then( response =>{
        console.log('PLATFORMS:',response.data)
        return res.status(200).json(response.data);
        })
    .catch((err)=>{
      return res.status(403).send(err);
    })  
    });
    
});

export const subscribeTopic = functions.https.onRequest((req,res) => {

    corsHandler(req,res,() =>{

    
    const browserToken = req.body.browserToken;
    const phoneToken = req.body.phoneToken;
    let tokens;
    const uid = req.body.uid;

    console.log('browser',browserToken);
    console.log('phone',phoneToken)

    if(phoneToken === undefined){
        tokens = [browserToken]
    }
    else if(browserToken === undefined){
        tokens = [phoneToken]
    }
    else{
        tokens = [browserToken,phoneToken];
    }
    const topic = req.body.topic;

    defaultMessaging.subscribeToTopic(tokens,'/topics/'+topic).then((response)=>{
        

        db.ref('/topics/'+topic+'/'+uid).set({
            username: req.body.username
        }).then(() =>{
            console.log('Successfully subscribed to topic:', response);
            res.json(response);
        })
        .catch((err)=>{
          console.log('Error setting topic');
        })


    })
    .catch((err)=>{
        console.log('Error subscribing to topic:', err);
    })

  })
});

export const inviteChatroom = functions.https.onRequest((req,res)=>{
  corsHandler(req,res,() =>{
    const uid = req.body.uid;
    const chatroomName = req.body.chatroomName;
    const username = req.body.username;
    const chatroomKey = req.body.chatKey;
    let browserToken;
    let phoneToken;
    console.log(uid);
    db.ref('/users/'+uid+'/browserToken').once('value').then((snap)=>{
        browserToken = snap.val();
        // See documentation on defining a message payload.
        if(browserToken !== null){
            const message = {
                notification: {
                    body: username+' is inviting you to join '+chatroomName+' chatroom!',
                    title: 'Chatroom Invitation'
                },
                token: browserToken,
                data:{
                    body:username+' is inviting you to join '+chatroomName+' chatroom!',
                    chatKey:chatroomKey,
                    title: 'Chatroom Invitation',
                    type:'chatroom'
                }
            };

            defaultMessaging.send(message).then((response) =>{
                console.log('Message sent successfully: ',response);
            })
            .catch((err)=>{
                console.log('Error sending browser message:',err);
                if(err.code === "messaging/registration-token-not-registered"){
                    db.ref('/users/'+uid).update({
                        not_available_browser:true
                    })
                    .catch((err) => {
                      console.log('Error updating user');
                    });
                }
            })
        }
  
    })
    .catch((err)=>{
      console.log('Error getting value:',err);
    })
    db.ref('/users/'+uid+'/phoneToken').once('value').then((snap) =>{
        phoneToken = snap.val();
        if(phoneToken !== null){
            const message = {
                notification: {
                body: username+' is inviting you to join '+chatroomName+' chatroom!',
                title: 'Chatroom Invitation'
                },
                token: phoneToken,
                data:{
                    body:username+' is inviting you to join '+chatroomName+' chatroom!',
                    chatKey:chatroomKey,
                    title: 'Chatroom Invitation',
                    type:'chatroom'
                }
            };

            defaultMessaging.send(message).then((response) =>{
                console.log('Message sent successfully: ',response);
            })
            .catch((err)=>{
                console.log('Error sending phone message:',err);
                if(err.code === "messaging/registration-token-not-registered"){
                    db.ref('/users/'+uid).update({
                        not_available_phone:true
                    })
                    .catch((err)=>{
                      console.log('Error updating user',err);
                    })
                }
            })
        }
    })
    .catch((err)=>{
      console.log('Error getting value',err);
    })
    res.json({message:'user notificated'});
  })
})

export const messageTopic = functions.https.onRequest((req,res) =>{
  corsHandler(req,res,()=>{
    const topic = req.body.topic;
    const user = req.body.user;
    const title = req.body.title;
    const uid = req.body.uid;
    db.ref('/users/'+uid).once('value').then((snap)=>{
    
    const coverPhoto = snap.val().coverPhoto;
    
    console.log('user',user);

        const message = {
            android:{
                priority:'high',
                notification: {
                    title: 'Game Notification',  
                    body: 'Trading partners have been found!',
                    clickAction:'FCM_PLUGIN_ACTIVITY',
                    sound:'default'
                  },
            },
            apns: {
                headers: {
                  'apns-priority': '10'
                },
                payload: {
                  aps: {
                    alert: {
                      title: 'Game Notification',  
                      body: 'Trading partners have been found!',
                    },
                    badge: 42,
                  }
                }
            },
            data:{
                title:'Game Notification',
                body:user.username+' is offering '+title,
                type:"offering",
                user:JSON.stringify(user),
                photo:coverPhoto,
                uid:uid,
                creationTime: Date.now().toString(),
                read:(false).toString()
            },
            topic: '/topics/'+topic
        } as admin.messaging.Message;

        


        db.ref('/topics/'+topic).once('value').then((snap) => {
            snap.forEach((childSnap) => {
                console.log('CHILD SNAP:',childSnap.val().username);
                const ref = db.ref('/notifications/'+childSnap.key).push();
                ref.set(message)
                .catch((err)=>{
                  console.log('Error setting message',err)
                })
                const secondRef = db.ref('/notifications/'+uid).push();
                db.ref('/users/'+childSnap.key).once('value').then((snap) =>{

                    const interestedMessage = {
                        data:{
                            title:'Game Notification',
                            body:snap.val().username+' is interested in '+title,
                            type:"interested",
                            user:JSON.stringify(snap.val()),
                            photo:snap.val().coverPhoto,
                            uid:childSnap.key,
                            creationTime: Date.now().toString(),
                            read:false
                        }
                    }
                    secondRef.set(interestedMessage)
                    .catch((err)=>{console.log('Error setting message',err)});

                })
                .catch((err)=>{
                  console.log('Error getting value:',err);
                })
                return false;
            })
            
        })
        .catch((err)=>{
          console.log('Error getting value',err);
        })


          
        // Send a message to devices subscribed to the provided topic.
        defaultMessaging.send(message)
            .then((response) => {
              // Response is a message ID string.
              console.log('Successfully sent message:', response);
              res.json(user);
            })
            .catch((error) => {
              console.log('Error sending message:', error);
            //   if(err.code === "messaging/registration-token-not-registered"){
            //     db.ref('/users/'+uid).update({
            //         not_available:true
            //     });
            // }
        });
    
    })
    .catch((err)=>{
      console.log('Error getting value',err);
    })
  })
})

export const createCharge = functions.https.onRequest((req,res) =>{
  corsHandler(req,res, () =>{
    const token = req.body.token;
    const email = req.body.email;
    const plan = req.body.plan;
    let amount,planNickname,planName;

    if(plan === 'planA'){
        planName = 'Lite';
        amount = 9.99;
        planNickname = "plan_DNOKWGbHkjcb5B";
    }
    else if(plan === 'planB'){
        planName = 'Standard';
        amount = 12.99;
        planNickname = "plan_DNOLcOOz5BI5wT";
    }
    else{
        planName = 'Premium'
        amount = 15.99;
        planNickname = "plan_DNOMy69O8tS8CD";
    }

    //check if it's already an Stripe customer
    db.ref('/users/'+req.body.uid).child('stripeId').once('value')
    .then((snap) => {
        if(snap.val()!== null){
            stripe.subscriptions.create({
                customer: snap.val(),
                items:[{
                    plan:planNickname
                }]
            }).then((data)=>{
                console.log('data',data);
                db.ref('/users/'+req.body.uid).update({
                    planName:planName,
                    stripeSubscriptionId: data.id,
                    paidMember:true
                })
                .catch((err)=>{
                  console.log('Error updating user',err);
                })
                res.json(data);
            })
            .catch((err)=>{
                console.log('Subscription failed:',err)
                res.json(err);
            })
        }
        else{
            stripe.customers.create({
                source: token,
                email: email,
            }).then((customer)=>{

                db.ref('/users/'+req.body.uid).update({
                    stripeId: customer.id
                }).then(()=>{
                    // Charge the Customer instead of the card:
                    stripe.subscriptions.create({
                        customer: customer.id,
                        items:[{
                            plan:planNickname
                        }]
                    }).then((data)=>{
                        console.log(data);
                        db.ref('/users/'+req.body.uid).update({
                            planName: planName,
                            stripeSubscriptionId: data.id,
                            paidMember:true
                        })
                        .catch((err)=>{
                          console.log('Error updating user:',err);
                        })
                        res.json(data);
                    })
                    .catch((err)=>{
                        console.log('Subscription failed',err);
                        res.json(err);
                    })
                })
                .catch((err)=>{
                    console.log('Error updating customer',err);
                    res.json(err);
                })
                
        
                
            });
        }
    })
    .catch((err)=>{
      console.log('Error getting value:',err);
    })

    

      
  })
})

export const tradeNotification = functions.https.onRequest((req,res) => {
  corsHandler(req,res,() => {
    const message = req.body.message;
    const username = req.body.username;
    const browserToken = req.body.browserToken;
    const phoneToken = req.body.phoneToken;
    const tradeKey = req.body.tradeKey; 
    const chatKey = req.body.chatKey;
    const games = req.body.games;
    // let uid = req.body.uid;

    console.log('trade called...');
    console.log('browser:',browserToken);
    console.log('phone:',phoneToken);
    console.log('tradeKey:',tradeKey);
    console.log('username:',username);
    console.log('type:',message);

    let messageTopic,messageBrowser,messagePhone;

    if(message === 'create'){

        for(let i = 0 ; i < games.length ; i++){
            console.log('GAME '+i+' :',games[i]);
        }

        messageTopic = {
            notification: {
                body: username+' is proposing you a trade! Check it out',
                title: 'Trade Notification',
            },
            topic:'/topics/'+tradeKey,
            data:{
                body:username+' is proposing you a trade! Check it out',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade',
                key:tradeKey,
                chatKey:chatKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };

        messageBrowser = {
            notification: {
                body: username+' is proposing you a trade! Check it out',
                title: 'Trade Notification',
            },
            token: browserToken,
            data:{
                body:username+' is proposing you a trade! Check it out',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade',
                key:tradeKey,
                chatKey: chatKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };

        messagePhone = {
            notification: {
                body: username+' is proposing you a trade! Check it out',
                title: 'Trade Notification',
            },
            token: phoneToken,
            data:{
                body:username+' is proposing you a trade! Check it out',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade',
                key:tradeKey,
                chatKey: chatKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };


        if(browserToken !== undefined && phoneToken !== undefined){

            db.ref('/users').orderByChild('browserToken').equalTo(browserToken).once('value').then((snap) =>{
                const uid = Object.keys(snap.val())[0];
                const tokens = [browserToken,phoneToken]
    
                defaultMessaging.subscribeToTopic(tokens,'/topics/'+tradeKey).then((response)=>{
                    console.log('Successfully subscribed to topic:', response);
        
                    
        
                    defaultMessaging.send(messageTopic).then((response) =>{
        
                        const notificationRefBrowser = db.ref('/notifications/'+uid).push();
                        messageTopic.games = games;
        
                        notificationRefBrowser.set(messageTopic).then(() =>{
                                console.log('Browser message sent successfully: ',response);
                                res.json(response);
                            
                        }).catch((err)=>{
                            console.log('Error saving notification:',err);
                            res.json(err);
                        });
                        
                        
                    })
                    .catch((err)=>{
                        console.log('Error sending browser message:',err);
                        // if(err.code === "messaging/registration-token-not-registered"){
                        //     db.ref('/users/'+uid).update({
                        //         not_available:true
                        //     });
                        // }
                        res.json(err);
                    });
                })
                .catch((err)=>{
                    console.log('Error subscribing to topic:', err);
                    res.json(err);
                });
            })
            .catch((err) => {
                console.log('Error retrieving data',err);
                res.json(err);
            })    
        }   
    
        else if(phoneToken !== undefined){
          db.ref('/users').orderByChild('phoneToken').equalTo(phoneToken).once('value').then((snap) =>{
            const uid = Object.keys(snap.val())[0];
            const notificationRefPhone = db.ref('/notifications/'+uid).push();
            defaultMessaging.send(messagePhone).then((response)=>{

                    
                    messagePhone.games = games;
                    notificationRefPhone.set(messagePhone).then(() =>{
                        console.log('Phone message sent successfully: ',response);
                        res.json(response);
                    })
                    .catch((err) => { 
                      console.log('Error setting data',err) 
                      res.json(err)})
                }).catch((err) => { 
                  console.log('Error sending phone message:',err);
                  if(err.code === "messaging/registration-token-not-registered"){
                    db.ref('/users/'+uid).update({
                        not_available_phone:true
                    })
                    .catch((err)=>{
                      console.log('Error updating value:',err);
                    })
                }
                res.json(err);
            })
            .catch((err)=>{
                console.log('Error retrieving data',err)
                
            })
          })
          .catch((err)=>{
            console.log('Error getting value:',err);
          })
        }
        else if(browserToken !== undefined){
            db.ref('/users').orderByChild('browserToken').equalTo(browserToken).once('value').then((snap) => {
                const uid = Object.keys(snap.val())[0];

                    defaultMessaging.send(messageBrowser).then((response)=>{


                    const notificationRefBrowser = db.ref('/notifications/'+uid).push();
                    messageBrowser.games = games;
                    notificationRefBrowser.set(messageBrowser).then(() =>{
                        console.log('Phone message sent successfully: ',response);
                        res.json(response);
                    }).catch((err) => {console.log('Error setting data',err)
                res.json(err)});

                }).catch((err) => {
                    console.log('Error sending phone message:',err);
                    if(err.code === "messaging/registration-token-not-registered"){
                        db.ref('/users/'+uid).update({
                            not_available_phone:true
                        }).then((data)=>{
                            res.json(data);
                        })
                        .catch((err)=>{
                          console.log('Error updating value:',err)
                        })
                    }
                });
                
            })
            .catch((err)=>{
                console.log('Error retrieving data',err)
                res.json(err)
            });
        }
        else{
            res.json({message:'no token available!'});
        }
    }


    else if(message === 'accept'){
        messageTopic = {
            notification: {
                body:'Your trade has been accepted! Please wait until our staff approves the trade.',
                title: 'Trade Notification',
            },
            topic:'/topics/'+tradeKey,
            data:{
                body:'Your trade has been accepted! Please wait until our staff approves the trade.',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade-accept',
                key:tradeKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };

        const messageTopicReceiver = {
            notification: {
                body:'You have accepted the trade! Please wait until our staff approves the trade.',
                title: 'Trade Notification',
            },
            topic:'/topics/'+tradeKey,
            data:{
                body:'You have accepted the trade! Please wait until our staff approves the trade.',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade-accept',
                key:tradeKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };


        messageBrowser = {
            notification: {
                body: 'Your trade has been accepted! Please wait until our staff approves the trade.',
                title: 'Trade Notification',
            },
            token: browserToken,
            data:{
                body:'Your trade has been accepted! Please wait until our staff approves the trade.',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade-accept',
                key:tradeKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };

        messagePhone = {
            notification: {
                body:'Your trade has been accepted! Please wait until our staff approves the trade.',
                title: 'Trade Notification',
            },
            token: phoneToken,
            data:{
                body:'Your trade has been accepted! Please wait until our staff approves the trade.',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade-accept',
                key:tradeKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };

        if(browserToken !== undefined && phoneToken !== undefined){

            db.ref('/trades/'+tradeKey).once('value').then((snap) =>{
                const uid = snap.val().proposer;
                const receiver = snap.val().receiver;
                const tokens = [browserToken,phoneToken]
    
                defaultMessaging.subscribeToTopic(tokens,'/topics/'+tradeKey).then((response)=>{
                    console.log('Successfully subscribed to topic:', response);
        
                    
        
                    defaultMessaging.send(messageTopic).then((response) =>{
        
                        const notificationRefBrowser = db.ref('/notifications/'+uid).push();
                        const receiverNotificationBrowser = db.ref('/notifications/'+receiver).push();

                        receiverNotificationBrowser.set(messageTopicReceiver).then(()=>{
                            console.log('Browser message sent successfully: ',response);
                            res.json(response);
                        })
                        .catch((err)=>{
                            console.log('Error setting data:',err);
                            res.json(err);
                        })
        
                        
                        notificationRefBrowser.set(messageTopic).then(() =>{
                                console.log('Browser message sent successfully: ',response);
                                res.json(response);
                            
                        }).catch((err) => {
                          console.log('Error setting data:',err);
                          res.json(err);
                        })
                        
                        
                    })
                    .catch((err)=>{
                        console.log('Error sending browser message:',err);
                        // if(err.code === "messaging/registration-token-not-registered"){
                        //     db.ref('/users/'+uid).update({
                        //         not_available:true
                        //     });
                        // }
                        res.json(err);
                    })
                })
                .catch((err)=>{
                    console.log('Error subscribing to topic:', err);
                    res.json(err);
                })
            })
            .catch((err) => {
                console.log('Error retrieving data',err);
                res.json(err);
            })    
        }   
    
        else if(phoneToken !== undefined){
          db.ref('/trades/'+tradeKey).once('value').then((snap) =>{

            const uid = snap.val().proposer;
            const notificationRefPhone = db.ref('/notifications/'+uid).push();
            defaultMessaging.send(messagePhone).then((response)=>{
    
                    notificationRefPhone.set(messagePhone).then(() =>{
                        console.log('Phone message sent successfully: ',response);
                        res.json(response);
                    })
                    .catch((err) => { console.log('Error setting data',err)
                res.json(err)})
                }).catch((err) => { 
                  console.log('Error sending phone message:',err);
                  if(err.code === "messaging/registration-token-not-registered"){
                      db.ref('/users/'+uid).update({
                          not_available_phone:true
                      })
                      .catch((err)=>{
                        console.log('Error updating value:',err);
                      })
                  }
                  res.json(err);
            })
        }).catch((err)=>{
          console.log('Error retrieving data',err)
          res.json(err)
        })
        }
        else if(browserToken !== undefined){
          db.ref('/trades/'+tradeKey).once('value').then((snap) => {
            const uid = snap.val().proposer;

            const notificationRefBrowser = db.ref('/notifications/'+uid).push();
            defaultMessaging.send(messageBrowser).then((response)=>{
    
                    notificationRefBrowser.set(messageBrowser).then(() =>{
                        console.log('Phone message sent successfully: ',response);
                        res.json(response);
                    }).catch((err) => {console.log('Error setting data',err)
                res.json(err)});

                }).catch((err) => { 
                  console.log('Error sending phone message:',err);
                  if(err.code === "messaging/registration-token-not-registered"){
                      db.ref('/users/'+uid).update({
                          not_available_phone:true
                      })
                      .catch((err)=>{
                        console.log('Error updating value:',err);
                      })
                  }
                  res.json(err);
                  
                
            })
        })
        .catch((err)=>{
          console.log('Error retrieving data',err)
          res.json(err)
        }) ;
        }
        else{
            res.json({message:'no token available!'});
        }
    }
    else{

        messageTopic = {
            notification: {
                body:'Your trade has been declined! Please try a different trade.',
                title: 'Trade Notification',
            },
            topic:'/topics/'+tradeKey,
            data:{
                body:'Your trade has been declined! Please try a different trade',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade-declined',
                key:tradeKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };

        messageBrowser = {
            notification: {
                body: 'Your trade has been declined! Please try a different trade',
                title: 'Trade Notification',
            },
            token: browserToken,
            data:{
                body:'Your trade has been declined! Please try a different trade',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade-declined',
                key:tradeKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };

        messagePhone = {
            notification: {
                body:'Your trade has been declined! Please try a different trade',
                title: 'Trade Notification',
            },
            token: phoneToken,
            data:{
                body:'Your trade has been declined! Please try a different trade',
                // chatKey:chatroomKey,
                title: 'Trade Notification',
                type:'trade-declined',
                key:tradeKey,
                creationTime: Date.now().toString(),
                read:(false).toString()
            }
        };

        if(browserToken !== undefined && phoneToken !== undefined){

            db.ref('/trades/'+tradeKey).once('value').then((snap) => {
                const uid = snap.val().proposer;
                const tokens = [browserToken,phoneToken]
    
                defaultMessaging.subscribeToTopic(tokens,'/topics/'+tradeKey).then((response)=>{
                    console.log('Successfully subscribed to topic:', response);
        
                    
        
                    defaultMessaging.send(messageTopic).then((response) =>{
        
                        const notificationRefBrowser = db.ref('/notifications/'+uid).push();
        
        
                        notificationRefBrowser.set(messageTopic).then(() =>{
                                console.log('Browser message sent successfully: ',response);
                                res.json(response);
                            
                        }).catch((err)=>{
                            console.log('Error saving notification:',err);
                            res.json(err);
                        })
                        
                        
                    })
                    .catch((err)=>{
                        console.log('Error sending browser message:',err);
                        if(err.code === "messaging/registration-token-not-registered"){
                            db.ref('/users/'+uid).update({
                                not_available_browser:true
                            })
                            .catch((err)=>{
                              console.log('Error updating value:',err);
                            })
                        }
                        res.json(err);
                    })
                })
                .catch((err)=>{
                    console.log('Error subscribing to topic:', err);
                    res.json(err);
                })
            })
            .catch((err) => {
                console.log('Error retrieving data',err);
                res.json(err);
            })    
        }   
    
        else if(phoneToken !== undefined){
          db.ref('/trades/'+tradeKey).once('value').then((snap) => {

            const uid = snap.val().proposer;
            const notificationRefPhone = db.ref('/notifications/'+uid).push();

            defaultMessaging.send(messagePhone).then((response)=>{
                    notificationRefPhone.set(messagePhone).then(() =>{
                        console.log('Phone message sent successfully: ',response);
                        res.json(response);
                    })
                    .catch((err) => { 
                        console.log('Error setting data',err)
                        res.json(err)
                      })
                }).catch((err) => { 
                  console.log('Error sending phone message:',err);
                  if(err.code === "messaging/registration-token-not-registered"){
                      db.ref('/users/'+uid).update({
                          not_available_phone:true
                      })
                      .catch((err)=>{
                        console.log('Error updating value:',err);
                      })
                  }
                  res.json(err);
            })
            
        })
        .catch((err)=>{
          console.log('Error retrieving data',err)
          res.json(err)
          
        })
      }
        else if(browserToken !== undefined){
          db.ref('/trades/'+tradeKey).once('value').then((snap) => {
            const uid = snap.val().proposer;

            const notificationRefBrowser = db.ref('/notifications/'+uid).push();

            defaultMessaging.send(messageBrowser).then((response)=>{

                
                    notificationRefBrowser.set(messageBrowser).then(() =>{
                        console.log('Phone message sent successfully: ',response);
                        res.json(response);
                    }).catch((err) => {console.log('Error setting data',err)
                res.json(err)});

                }).catch((err) => { 
                  console.log('Error sending phone message:',err);
                  if(err.code === "messaging/registration-token-not-registered"){
                      db.ref('/users/'+uid).update({
                          not_available_phone:true
                      })
                      .catch((err)=>{
                        console.log('Error updating value:',err);
                      })
                  }
                  res.json(err);
                  });
                
            })
            .catch((err)=>{
              console.log('Error retrieving data',err)
              res.json(err)
            });
        }
        else{
            res.json({message:'no token available!'});
        }

    }
    
  })
})

export const unsubscribeTopic = functions.https.onRequest((req,res) =>{
  corsHandler(req,res,() =>{
    const uid = req.body.uid;
    const id = req.body.gameId;

    db.ref('/users/'+uid).once('value').then((snap) =>{
        const browserToken = snap.val().browserToken;
        const phoneToken = snap.val().phoneToken;

        if(browserToken !== undefined && phoneToken !== undefined){
            const tokens = [browserToken,phoneToken];

            defaultMessaging.unsubscribeFromTopic(tokens,id).then((snap)=>{
                console.log('Unsubscribed from topic')
                res.json(snap);
            }).catch((err)=>{
                console.log('Error unsubscribing from topic:',err)
                res.json(err);
            });

        }
        else if(browserToken !== undefined){
            defaultMessaging.unsubscribeFromTopic(browserToken,id).then((snap)=>{
                console.log('Unsubscribed from topic')
                res.json(snap);
            }).catch((err)=>{
                console.log('Error unsubscribing from topic:',err)
                res.json(err);
            });
        }
        else if(phoneToken !== undefined){
            defaultMessaging.unsubscribeFromTopic(phoneToken,id).then((snap)=>{
                console.log('Unsubscribed from topic')
                res.json(snap);
            }).catch((err)=>{
                console.log('Error unsubscribing from topic:',err)
                res.json(err);
            });
        }
        else{
            console.log('user has no token');
            res.json({message:'user has no token'});
        }
        
    })
    .catch((err)=>{
      console.log('Error getting value:',err)
    })

  })
})

export const friendNotification = functions.https.onRequest((req,res) => {
    corsHandler(req,res,()=>{
    const username = req.body.username;
    const uid = req.body.userKey;
    const photoUID = req.body.uid;

    console.log('body:',req.body);
    console.log('PHOTO UID:',photoUID);

    db.ref('/users/'+photoUID).once('value').then((user) => {
        const photo = user.val().coverPhoto;
    
    db.ref('/notifications/'+uid).once('value').then((data)=>{
        let count = 0;
        data.forEach((notification)=>{
            if(notification.val().data.type === 'social' && notification.val().data.uid === photoUID){
                count++;
            }
            return false;
        })

    
    

    db.ref('/users/'+uid).once('value').then((data) => {

        if(data.val().not_available_phone && data.val().not_available_browser){
            console.log("user doesn't have a valid token");
            res.json({error:true,message:'user token is expired'});
        }
        else if(count>0){
            console.log('user has already been notificated');
            res.json({message:'user has already been notificated'});
        }
        else{
        const browserToken = data.val().browserToken;
        const phoneToken = data.val().phoneToken;
        const availablePhone = data.val().not_available_phone;
        const availableBrowser = data.val().not_available_browser;

        console.log('Retrieved browser token:',browserToken);
        console.log('Retrieved phoneToken:',phoneToken);

        const messageBrowser = {
            notification:{
                title:'Friend Notification',
                body: username + ' added you as a friend!',
            },
            token:browserToken,
            data:{
                body: username + ' added you as a friend!',
                username: username,
                type:'social',
                photo:photo,
                uid:photoUID,
                creationTime: Date.now().toString(),
                // read:false
            }
        }

        const messagePhone = {
            notification:{
                title:'Friend Notification',
                body: username + ' added you as a friend!',
            },
            token: phoneToken,
            data:{
                body: username + ' added you as a friend!',
                username: username,
                type:'social',
                photo:photo,
                uid:photoUID,
                creationTime: Date.now().toString(),
                // read:false
            }
        }

        
        // if(browserToken !== null){
        //     defaultMessaging.send(messageBrowser);
        // }

        // if(phoneToken !== null){
        //     defaultMessaging.send(messagePhone);
        // }

            if(browserToken !== undefined && phoneToken !== undefined && (!availableBrowser && !availablePhone)){
                const browserRef = db.ref('/notifications/'+uid).push();
                browserRef.set({
                    data:{
                        body: username + ' added you as a friend!',
                        username: username,
                        type:'social',
                        photo:photo,
                        uid:photoUID,
                        creationTime: Date.now(),
                        read:false
                    }

                }).then(() =>{
                    defaultMessaging.send(messageBrowser).then(() =>{
                        
                            defaultMessaging.send(messagePhone).then(()=>{
                                res.json({message:'friend notification sent!'})
                            
                        }).catch((err)=>{
                            console.log('Error sending phone message:',err.code);
                            if(err.code === "messaging/registration-token-not-registered"){
                                db.ref('/users/'+uid).update({
                                    not_available_phone:true
                                })
                                .catch((err)=>{
                                  console.log('Error updating value:',err);
                                })
                            }
                            res.json(err);
                        })
                    }).catch((err)=>{
                        console.log('Error sending browser message:',err.code);
                        if(err.code === "messaging/registration-token-not-registered"){
                            db.ref('/users/'+uid).update({
                                not_available_browser:true
                            })
                            .catch((err)=>{
                              console.log('Error updating value:',err);
                            })
                        }
                        res.json(err)
                    })
                })
                .catch((err)=>{
                  console.log('Error setting value:',err);
                })
            }
            else if(phoneToken !== undefined && !availablePhone){
                defaultMessaging.send(messagePhone).then(() =>{
                    const phoneRef = db.ref('/notifications/'+uid).push();
                    phoneRef.set({
                        data:{
                            body: username + ' added you as a friend!',
                            username: username,
                            type:'social',
                            photo:photo,
                            uid:photoUID,
                            creationTime:Date.now(),
                            read:false
                        }
                    }).then(()=>{
                        res.json({message:'friend notification sent!'})
                    })
                    .catch((err)=>{
                      console.log('Error setting value:',err);
                    })
                }).catch((err) =>{
                    console.log('Error sending phone message:',err.code);
                    if(err.code === "messaging/registration-token-not-registered"){
                        db.ref('/users/'+uid).update({
                            not_available_phone:true
                        })
                        .catch((err)=>{
                          console.log('Error updating value:',err);
                        })
                    }
                    res.json(err);
                })
                
            }
            else if(browserToken !== undefined && !availableBrowser){
                defaultMessaging.send(messageBrowser).then(() => {
                    const browserRef = db.ref('/notifications/'+uid).push();
                    browserRef.set({
                        data:{
                            body: username + ' added you as a friend!',
                            type:'social',
                            username: username,
                            photo:photo,
                            uid:photoUID,
                            creationTime:Date.now(),
                            read:false
                        }
                    }).then(()=>{
                        res.json({message:'friend notification sent!'})
                    })
                    .catch((err)=>{
                      console.log('Error setting value:',err);
                    })
                }).catch((err)=>{
                    console.log('Error sending browser message:',err.code);
                    if(err.code === "messaging/registration-token-not-registered"){
                        db.ref('/users/'+uid).update({
                            not_available_browser:true
                        })
                        .catch((err)=>{
                          console.log('Error updating value:',err);
                        })
                    }
                    res.json(err);
                })
                
            }
            else{
                console.log('no token associated with this user...');
                res.json({message:'no token found!'});
            }
        
        }

        })
        .catch((err)=>{
          console.log('Error getting value:',err);
        })

    })
    .catch((err)=>{
      console.log('Error getting value:',err);
    })

    })
    .catch((err)=>{
      console.log('Error getting value:',err)
    })
    })
})

export const newDirectMessage = functions.https.onRequest((req,res) =>{

    corsHandler(req,res,() =>{

    
  console.log('new Direct');

    const uid = req.body.uid;
    const chatKey = req.body.chatKey;
    const username = req.body.username;
    const messageBody = req.body.message;
    const photo = req.body.photo;
    let receiverUid = {};

    

    db.ref('/directChats/'+chatKey+'/participants').once('value').then((snap)=>{


        snap.forEach((participant)=>{
            if(participant.key !== uid){
                receiverUid = participant.key;
            }
            return false;
        })

        db.ref('/users/'+receiverUid).once('value').then((snap)=>{

            const receiverUsername = snap.val().username;
            const browserToken = snap.val().browserToken;
            const phoneToken = snap.val().phoneToken;


            console.log('Receiver uid:',receiverUid);
            console.log('CHAT DISABLE:',snap.val().chat_notification_disable);
            console.log('BROWSER DISABLE:',snap.val().not_available_browser);
            console.log('PHONE DISABLE:',snap.val().not_available_phone);
            console.log('browser token:',browserToken);
            console.log('phone Token:',phoneToken);



            if(snap.val().not_available_browser && snap.val().not_available_phone){
                res.json({message:"can't notificate this user"});
            }
            else if(snap.val().chat_notification_disable){
                res.json({message:"can't notificate this user"});
            }
            else if(snap.val().not_available_browser){
                if(phoneToken !== undefined || phoneToken!== null){

                    const message = {
                        token: phoneToken,
                        android:{
                            priority:'high',
                            notification: {
                                title: username + ' sent you a direct message',
                                body: username + ': '+ messageBody,
                                clickAction:'FCM_PLUGIN_ACTIVITY',
                                sound:'default'
                              },
                              data:{
                                body: username + ': '+messageBody,
                                type:'social',
                                photo:photo,
                                uid:uid,
                                creationTime: Date.now().toString(),
                                chatFlag:"true",
                                username:username,
                                chatKey:chatKey,
                                receiverUsername:receiverUsername,
                                receiverUid:receiverUid
                            }
                        },
                        apns: {
                            headers: {
                              'apns-priority': '10'
                            },
                            payload: {
                              aps: {
                                alert: {
                                  title: username + ' sent you a direct message',
                                  body: username + ': '+ messageBody,
                                },
                                badge: 42,
                              }
                            }
                        },
                        data:{
                            body: username + ': '+messageBody,
                            type:'social',
                            photo:photo,
                            uid:uid,
                            creationTime: Date.now().toString(),
                            chatFlag:"true",
                            username:username,
                            chatKey:chatKey,
                            receiverUsername:receiverUsername,
                            receiverUid:receiverUid
                        },
                    } as any;
                   

                    const notificationRef = db.ref('/notifications/'+receiverUid).push();
                    notificationRef.set(message).then(()=>{
                        defaultMessaging.send(message).then((data)=>{
                            res.json(data);
                        })
                        .catch((err)=>{
                            if(err.code === "messaging/registration-token-not-registered"){
                                db.ref('/users/'+receiverUid).update({
                                    not_available_phone:true
                                })
                                .catch((err)=>{
                                  console.log('Error updating value:',err);
                                })
                            }
                            console.log('Error sending phone notification:',err);
                            res.json(err);
                        })
                    })
                    .catch((err)=>{
                        console.log('Error saving value:',err);
                        res.json(err);
                    })
                   
                }
                else{
                    res.json({message:'no device to send'});
                }
            }
            else if(snap.val().not_available_phone){
                if(browserToken !== null || browserToken !== undefined){
                    const message = {
                        token: browserToken,
                        notification:{
                            title: username + ' sent you a direct message',
                            body: username + ': '+messageBody,
                        },
                        data:{
                            body: username + ': '+messageBody,
                            type:'social',
                            photo:photo,
                            uid:uid,
                            creationTime: Date.now().toString(),
                            chatFlag:"true",
                            username:username,
                            chatKey:chatKey,
                            receiverUsername:receiverUsername,
                            receiverUid:receiverUid
                        }
                    } as any;

                    const notificationRef = db.ref('/notifications/'+receiverUid).push();
                    notificationRef.set(message).then(()=>{
                        defaultMessaging.send(message).then((data)=>{
                            res.json(data);
                        })
                        .catch((err)=>{
                            if(err.code === "messaging/registration-token-not-registered"){
                                db.ref('/users/'+receiverUid).update({
                                    not_available_browser:true
                                })
                                .catch((err)=>{
                                  console.log('Error updating value:',err);
                                })
                            }
                            console.log('Error sending browser notification:',err);
                            res.json(err);
                        })
                    })
                    .catch((err)=>{
                        console.log('Error saving value:',err);
                        res.json(err);
                    })
                }
                else{
                    res.json({message:'no device to send'});
                }
            }
            else{
                if( (browserToken !== null || browserToken !== undefined) && (phoneToken !== null || phoneToken !== undefined)){

                    const messagePhone = {
                        token: phoneToken,
                        android:{
                            priority:'high',
                            notification: {
                                title: username + ' sent you a direct message',
                                body: username + ': '+ messageBody,
                                clickAction:'FCM_PLUGIN_ACTIVITY',
                                sound:'default'
                              },
                              data:{
                                body: username + ': '+messageBody,
                                type:'social',
                                photo:photo,
                                uid:uid,
                                creationTime: Date.now().toString(),
                                chatFlag:"true",
                                username:username,
                                chatKey:chatKey,
                                receiverUsername:receiverUsername,
                                receiverUid:receiverUid
                            }
                        },
                        apns: {
                            headers: {
                              'apns-priority': '10'
                            },
                            payload: {
                              aps: {
                                alert: {
                                  title: username + ' sent you a direct message',
                                  body: username + ': '+ messageBody,
                                },
                                badge: 42,
                              }
                            }
                        },
                        data:{
                            body: username + ': '+messageBody,
                            type:'social',
                            photo:photo,
                            uid:uid,
                            creationTime: Date.now().toString(),
                            chatFlag:"true",
                            username:username,
                            chatKey:chatKey,
                            receiverUsername:receiverUsername,
                            receiverUid:receiverUid
                        },
                    } as any;
                const messageBrowser= {
                    notification:{
                        title: username + ' sent you a direct message',
                        body: username + ': '+messageBody,
                    },
                    token: browserToken,
                    data:{
                        body: username + ': '+messageBody,
                        type:'social',
                        photo:photo,
                        uid:uid,
                        creationTime: Date.now().toString(),
                        chatFlag:"true",
                        username:username,
                        chatKey:chatKey,
                        receiverUsername:receiverUsername,
                        receiverUid:receiverUid
                    }
                } as any;

                
                const notificationRef = db.ref('/notifications/'+receiverUid).push();
                notificationRef.set(messageBrowser).then(()=>{
                    defaultMessaging.send(messagePhone).then(()=>{
                        defaultMessaging.send(messageBrowser).then((data)=>{
                            res.json(data);
                        })
                        .catch((err)=>{
                            if(err.code === "messaging/registration-token-not-registered"){
                                db.ref('/users/'+receiverUid).update({
                                    not_available_browser:true
                                })
                                .catch((err)=>{
                                  console.log('Error updating value:',err);
                                })
                            }
                            console.log('Error sending browser notification:',err);
                            res.json(err);
                        })
                    })
                    .catch((err)=>{
                        if(err.code === "messaging/registration-token-not-registered"){
                            db.ref('/users/'+receiverUid).update({
                                not_available_phone:true
                            })
                            .catch((err)=>{
                              console.log('error updating value:',err);
                            })
                        }
                        console.log('Error sending phone notification:',err);
                        res.json(err);
                    })
                })
                .catch((err)=>{
                    console.log('Error saving value:',err)
                    res.json(err);
                })
               
            }
            else{
                res.json({message:'no devices found'});
            }
        }





        })
        .catch((err)=>{
          console.log('error getting value:',err);
        })

    })
    .catch((err)=>{
      console.log('Error getting value:',err);
    })
})
})

export const getGames = functions.https.onRequest((req,res) => {
  corsHandler(req,res,() =>{

    const platforms = [];
    db.ref('/platformTable').once('value').then((snap)=>{
        snap.forEach((platform)=>{
            platforms.push(platform.val());
            return false;
        })

        const idArray = platforms.map( e => e.id).join(',');

        console.log('platform ids:',idArray)
        console.log('platforms array:',platforms);
        console.log(req.body);



        if(req.body.query !== ''){

            if(req.body.platformID !== undefined && req.body.platformID !== null){
            console.log(req.body.platformID);
            const queryLowerCase = req.body.query.toLowerCase();
            db.ref('/videogames/'+req.body.platformID).orderByChild('titleLower').startAt(queryLowerCase).endAt(queryLowerCase+'\uf8ff').limitToFirst(15).once('value')
            .then( (snap) =>{
                if(snap.val() !== null && snap.numChildren() > 10 ){
                        const array = [];
                        snap.forEach((child)=>{
                            console.log(child.val());
                            array.push(child.val());
                            return false;
                        })
                        res.json(array);
                    }
                else{

                    console.log('no title found');
                
                    axios.get('https://api-endpoint.igdb.com/games/?search='+req.body.query+'&fields=name,cover,genres,first_release_date,esrb&filter[version_parent][not_exists]=1&expand=genres&filter[release_dates.platform][eq]='+req.body.platformID,{headers:{ 'user-key':api_key,'Accept':'application/json'}})
                    .then( response => {
                            
                            response.data.forEach( (videogame) =>{
                                console.log(videogame);



                                const videogameRef = db.ref('/videogames/'+req.body.platformID+'/'+videogame.id);

                                if( videogame.genres !== undefined && videogame.first_release_date !== undefined && videogame.cover !== undefined){

                                    const coverImage = ("//images.igdb.com/igdb/image/upload/t_cover_small_2x/"+videogame.cover.cloudinary_id+'.jpg').substring(2);

                                    if(videogame.esrb !== undefined){
                                        videogameRef.set({
                                            id:videogame.id,
                                            name:videogame.name,
                                            titleLower:videogame.name.toLowerCase(),
                                            offering_count:0,
                                            genres:[
                                                {
                                                    name:   videogame.genres[0].name
                                                }
                                                ],
                                            first_release_date:videogame.first_release_date,
                                            esrb:{
                                                    rating:videogame.esrb.rating
                                                },
                                            cover:{
                                                url:coverImage,
                                                cloudinary_id:videogame.cover.cloudinary_id
                                                }
                                        })
                                        .catch((error)=>{
                                            console.log('Error setting value:',error);
                                        })
                                    }
                                    else{
                                        videogameRef.set({
                                            id:videogame.id,
                                            name:videogame.name,
                                            titleLower:videogame.name.toLowerCase(),
                                            offering_count:0,
                                            genres:[
                                                {
                                                    name:   videogame.genres[0].name
                                                }
                                                ],
                                            first_release_date:videogame.first_release_date,
                                            esrb:{
                                                    rating:'undefined'
                                                },
                                            cover:{
                                                url:coverImage,
                                                cloudinary_id:videogame.cover.cloudinary_id
                                                }
                                        })
                                        .catch((error)=>{
                                            console.log('Error setting value:',error);
                                        })
                                    }
                                      
                                }
                                // console.log(videogame);
                            })

                            res.json(response.data);
                            // console.log(response.data)
                        
                        })
                        .catch(error=>{
                            console.log(error);
                        })
                    }
                })
                .catch((error)=>{
                    console.log('Error getting value:',error);
                })
            }
            else{
            const queryLowerCase = req.body.query.toLowerCase();

            axios.get('https://api-endpoint.igdb.com/games/?search='+queryLowerCase+'&fields=name,cover,first_release_date,esrb,genres,platforms,popularity&filter[version_parent][not_exists]=1&limit=15',{headers:{ 'user-key':api_key,'Accept':'application/json'}})

                    .then( response => {
                            console.log('server returned:',response.data);
                            for(let index = 0 ; index < response.data.length ; index++){
                                const game = response.data[index];
                                if(game.hasOwnProperty('genres') && game.hasOwnProperty('platforms')){
                                    if(response.data[index].cover !== undefined){
                                        response.data[index].cover.url = "//images.igdb.com/igdb/image/upload/t_cover_small_2x/"+response.data[index].cover.cloudinary_id+'.jpg';
                                    }

                                    for(let i = 0; i < game.platforms.length; i++){
                                        for(const platform of platforms){
                                            if(game.platforms[i] === platform.id){
                                                response.data[index].platforms[i] = platform;
                                            }
                                        }
                                    }
                                    // game.platforms.forEach((gamePlatform,index2)=>{
                                    //     console.log('game platform:',gamePlatform);
                                    //     platforms.forEach((platform,index3)=>{
                                    //         console.log('array platform',platform.id);
                                    //         if(gamePlatform === platform.id){
                                    //             response.data[index].platforms[index2] = platforms[index3];
                                                
                                    //         }
                                    //     })
                                    // })  
                                    
                                }
                                else{
                                    response.data.splice(index,1);
                                }
                            }
                            // response.data.forEach((game,index)=>{
                            //     if(game.hasOwnProperty('genres') && game.hasOwnProperty('platforms')){
                            //         if(response.data[index].cover !== undefined){
                            //             response.data[index].cover.url = "//images.igdb.com/igdb/image/upload/t_cover_small_2x/"+response.data[index].cover.cloudinary_id+'.jpg';
                            //         }

                            //         for(let i = 0; i < game.platforms.length; i++){
                            //             for(const platform of platforms){
                            //                 if(game.platforms[i] === platform.id){
                            //                     response.data[index].platforms[i] = platform;
                            //                 }
                            //             }
                            //         }
                            //         // game.platforms.forEach((gamePlatform,index2)=>{
                            //         //     console.log('game platform:',gamePlatform);
                            //         //     platforms.forEach((platform,index3)=>{
                            //         //         console.log('array platform',platform.id);
                            //         //         if(gamePlatform === platform.id){
                            //         //             response.data[index].platforms[index2] = platforms[index3];
                                                
                            //         //         }
                            //         //     })
                            //         // })  
                                    
                            //     }
                            //     else{
                            //         response.data.splice(index,1);
                            //     }
                            // })

                            response.data.forEach((game,index)=>{
                                if(game.hasOwnProperty('genres') && game.hasOwnProperty('platforms')){
                                    if(game.platforms.length === 0 || game.platforms.length === undefined){
                                        response.data.splice(index,1);
                                    }
                                    else{
                                        game.platforms.forEach((platform,index2)=>{
                                            if(platform.id === undefined){
                                                response.data[index].platforms.splice(index2,1);
                                                if(response.data[index].platforms.length === 0){
                                                    response.data.splice(index,1);
                                                }
                                            }
                                        })
                                    }
                                }
                                else{
                                    response.data.splice(index,1); 
                                }
                            })

                            const reads = [];
                            response.data.forEach((game,index)=>{
                                if(game.hasOwnProperty('genres') && game.hasOwnProperty('platforms')){
                                    game.genres.forEach((genre,index2)=>{
                                        const promise = axios.get('https://api-endpoint.igdb.com/genres/'+genre+'?fields=*',{headers:{ 'user-key':api_key,'Accept':'application/json'}}).then((res)=>{
                                            response.data[index].genres[index2] = res.data[0];
                                            return 'promise finished';
                                        },err =>{
                                            return 'promise rejected';
                                        })
                                        reads.push(promise);
                                    })
                                }
                                else{
                                    response.data.splice(index,1);
                                }
                            })

                            Promise.all(reads).then((values)=>{
                                return res.status(200).json(response.data);
                            })
                            .catch((err)=>{
                                return res.send(err);
                            })
                            
                    })
                        .catch(error=>{
                            console.log(error);
                            return res.status(400).send(error);
                        })
            }
        }
        else{
            res.json({value:"Empty request"});
        }

    })
    .catch((error)=>{
        console.log('Error getting value');
    })
    

  })
})

export const getTrades = functions.https.onRequest((req,res) => {
  corsHandler(req,res,() => {

  
  const lastKey = req.body.lastKey;

  console.log('LAST KEY:',lastKey);

  if(lastKey !== "" && lastKey !== undefined){
      console.log('case 1')
      db.ref('/trades/').orderByKey().limitToLast(5).endAt(lastKey).once('value').then((snap)=>{
          const trades = [];

          snap.forEach((data : DataSnapshot) => {
              const obj = {
                  trade: data.val(),
                  key:data.key
              };
              trades.push(obj);
              return false;
          })

          console.log(trades);  
          
          for(let i = 0 ; i < trades.length ; i ++){
              for(let j = 0 ; j < trades[i].trade.items.length ; j++){
                  trades[i].trade.items[j].game.platform = trades[i].trade.items[j].game.platform.toLowerCase();
                  trades[i].trade.items[j].game.title = trades[i].trade.items[j].game.title.toLowerCase();
              }
          }

          trades.reverse();

          res.send(trades);
      })
      .catch((err)=>{
        res.send(err)
      })
  }
  else{
      console.log('case 2')
      db.ref('/trades/').orderByKey().limitToLast(5).once('value').then((snap)=>{
          const trades = [];   

          snap.forEach((data) =>{
              const obj = {
                  trade: data.val(),
                  key:data.key
              };
              trades.push(obj);
              return false;
          })

          console.log(trades);

          for(let i = 0 ; i < trades.length ; i ++){
              for(let j = 0 ; j < trades[i].trade.items.length ; j++){
                  trades[i].trade.items[j].game.platform = trades[i].trade.items[j].game.platform.toLowerCase();
                  trades[i].trade.items[j].game.title = trades[i].trade.items[j].game.title.toLowerCase();
              }
          }


          trades.reverse();

          res.send(trades);
      })
      .catch((err)=>{
        res.send(err);
      })
  }
})
})

export const getGame = functions.https.onRequest((req,res)=>{
    corsHandler(req,res,()=>{

        const gameId = req.body.id;
        const platforms = [];

        db.ref('/platformTable').once('value').then((snap)=>{
            snap.forEach((platform)=>{
                platforms.push(platform.val());
                return false;
            });

            axios.get('https://api-endpoint.igdb.com/games/'+gameId+'?fields=*',{headers:{ 'user-key':api_key,'Accept':'application/json'}})
            .then((response) =>{
                const coverImage = ("//images.igdb.com/igdb/image/upload/t_cover_small_2x/"+response.data[0].cover.cloudinary_id+'.jpg').substring(2);


                if(response.data[0].screenshots !== undefined){
                    response.data[0].screenshots.forEach((screenshot,index)=>{
                        const coverImage = ("//images.igdb.com/igdb/image/upload/t_screenshot_huge/"+screenshot.cloudinary_id+'.jpg').substring(2);
                        response.data[0].screenshots[index].url = coverImage;
                    })
                }

                response.data[0].cover.url = coverImage;
                response.data[0].platforms.forEach((dataPlatform,index)=>{
                    platforms.forEach((platform)=>{
                        if(platform.id === dataPlatform){
                            response.data[0].platforms[index] = platform;
                        }
                    });
                });

                axios.get('https://api-endpoint.igdb.com/genres/'+response.data[0].genres[0]+'?fields=*',{headers:{ 'user-key':api_key,'Accept':'application/json'}})
                .then((genre)=>{
                    response.data[0].genres[0] = genre.data[0];
                    return res.status(200).json(response.data);
                })

            })
        })
        .catch((err)=>{
            console.log('Error retrieving data:',err);
            return res.send(err);
        })

        

    })
})
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

