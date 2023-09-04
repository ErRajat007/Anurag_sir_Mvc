const scheduleLib = require('node-schedule');
const ReminderModel = require('../models/reminder');
const UserModel = require('../models/user');
const CourseModel = require('../models/course');
const { pushNotification } = require('../helpers/utils');

async function rescheduleReminder() {
	try {
		const scheduledReminders = await ReminderModel.find();
		scheduledReminders.forEach(async scheduledReminder => {

			const userData = await UserModel.findOne({ _id: scheduledReminder.user });
			const courseData = await CourseModel.findOne({ _id: scheduledReminder.course });

			let dataData = scheduledReminder.reminderDate.split('-');
			let year = parseInt(dataData[0]);
			let month = parseInt(dataData[1] - 1);
			let date = parseInt(dataData[2]);
			
			let time = scheduledReminder.reminderTime.split(':');
			let hour = parseInt(time[0]);
			let min = parseInt(time[1]);
			
			const scheduleId = scheduledReminder._id.toString();
		
			const DateData = new Date(year, month, date, hour, min);

			const job = scheduleLib.scheduleJob( scheduleId, DateData, async result => {
					let msg = {
						notification : {
							title : 'Reminder to read course',
							body  : `This is reading reminder for course - ${courseData.title} `
						},
					};

					await pushNotification(userData.fcmToken, msg);
					console.log('Notification sent');
					const deleteReminder = await ReminderModel.findOneAndDelete({_id: scheduleId})
                          console.log(" reminder deleted");


				
				}
			);
		});
	} catch (error) {
		console.log(error)
	}
}
module.exports = { rescheduleReminder };
