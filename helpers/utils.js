//------------------avgRating--------------------
async function avgRatings(five, four, three, two, one) {
	var avg = parseFloat(
		(5 * five + 4 * four + 3 * three + 2 * two + 1 * one) /
			(five + four + three + two + one)
	).toFixed(2);

	return avg;
}

//------------------------------------------------

// Firebase Setup
const admin = require('firebase-admin');
const serviceAccount = require('../helpers/firebase.json');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

//------------------------------------	-------------------------------------

async function pushNotification(registrationToken, messageObject) {
	try {
		let sendOptions = { priority: 'high', timeToLive: 60 * 60 * 24 };
		let data = await admin
			.messaging()
			.sendToDevice(registrationToken, messageObject, sendOptions)
			//.then(function (data) {
				console.log('data', data);
                console.log("result",data.results);
				console.log('error', data.results[0].error);
				return data;
			//})
			// .catch(function (err) {
             
			// 	return err;
			// });
	} 
	catch (err) {
		console.log("error",err);
		return err;
	}
}
//===============================================================================

async function pushNotifications(registrationTokens,messageObject) {
	try {
		let sendOptions = { priority: 'high', timeToLive: 60 * 60 * 24 };
		admin
			.messaging()
            .sendMulticast(registrationTokens,messageObject,sendOptions)
			.then(function (data) {
				console.log('data1', data);
                console.log("result1",data.responses);
				//console.log('error1', data.results[0].error);
				return data;
			})
			.catch(function (err) {
				console.log("error",err);
				return err;
			});
	} catch (err) {
		console.log("error",err);
		return err;
	}
}

module.exports = { pushNotification, avgRatings , pushNotifications };

//-----------------------------------------------------------------------
