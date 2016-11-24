var express = require('express');
var apn = require('apn');
var gcm = require('node-gcm');

var app = new express();
var server = require('http').Server(app);

var tokenIOS = '';
var tokenAndroid = '';

/**

 ---------------- !!!!  ----------------
 Setup/Installation : Follow steps 1 and 2 to get the server running
 ---------------- !!!! ----------------


 This is used to send push notifications
 to the ios or android app

 This is how the pushConfig.js could look like:

 var pushConfig = {

    ios: {
        token:{
            key:'YOUR_CERTIFICATE.p8', // filename of your cerificate
            keyId:'YOUR_KEY_ID', // is listed in the the member center, when you download the certificate
            teamId:'YOUR_TEAM_ID' // listed on https://developer.apple.com/account/#/membership/ (you obviously need to login to see this)
        },
    },
    android: {
        key:'YOUR_KEY_ID' //
    }
    }

 module.exports = pushConfig;

 */

/*

 Usage:

 npm start

 then type 'ios' or 'android' to send a notification



 also remember to start the devServer under devServer/

 with npm start

 */


// 1. Step: you have to create this file by yourself (see above)
var pushConfig = require('./pushConfig.js');

var apnConnection = new apn.Provider({
    token:{
        key: pushConfig.ios.token.key,
        keyId: pushConfig.ios.token.keyId,
        teamId: pushConfig.ios.token.teamId
    },
    production:false,
});

var sendNotificationiOS = function () {

    var notification = new apn.Notification();
    notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    notification.badge = 1;

    // 2. Step: you need to set this to your app identifier !
    notification.topic = 'com.wesel.NativeBridgeReact';
    //note.sound = "knock.aiff";
    notification.alert = "alert";
    notification.payload = {someData:1};


    console.log('sendNotificationiOS');
    apnConnection.send(notification, tokenIOS).then(function (response)
    {
        console.log(response);
    });
}

apnConnection.on('transmitted', function(notification, device)
{
    console.log("Notification transmitted to: " + device.token.toString('hex'));
});

var sendNotificationAndroid = function ()
{
    var sender = new gcm.Sender(pushConfig.android.key);
    var notification = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 3,
        data: {
            title: 'test',
            message: "",
            payload:{}
        }
    });

    sender.sendNoRetry(notification, tokenAndroid, function(err, result)
    {
        console.log(result,err);
    });
}

// The webpack dev server is running on a different port than this server, so we need cors enabled
app.use('/',function (req, res, next) // CORS
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'content-type, Authorization, Content-Length, X-Requested-With, Origin, Accept');
    if ('OPTIONS' === req.method) { res.sendStatus(200);
    } else { next(); }
});

app.get('/', function (req, res)
{
    res.sendFile( 'client/index.html',{'root': __dirname+'/../'});
});

// The required token to send a push notification is received here
app.get('/ios/:token/:os', function (req, res)
{
    console.log(req.params);
    if (req.params.os == 'ios')
    {
        tokenIOS = req.params.token;
    }
    if (req.params.os == 'android')
    {
        tokenAndroid = req.params.token;
    }
});

server.listen(8000,'0.0.0.0', function(error)
{
    if (error) {
        con.error(error)
    } else {
        console.log("Server Up at",8000);
    }
})

// Parsing the commmand line input
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (text)
{
    if (text.indexOf('ios') != -1)
    {
        sendNotificationiOS();
    }
    if (text.indexOf('android') != -1)
    {
        sendNotificationAndroid();
    }
});
