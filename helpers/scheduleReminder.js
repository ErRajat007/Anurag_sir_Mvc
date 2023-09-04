const scheduleLib = require("node-schedule");
const ReminderModel = require('../models/reminder')
const { pushNotification } = require('../helpers/utils')

exports.scheduleReminder = async (min,hour,date,month,year,id,fcmToken, msg) => {

    const newDate = new Date(year,month,date,hour,min)

    const job = scheduleLib.scheduleJob( id.toString(),newDate, async (result) =>
                                        { 
                                          await  pushNotification(fcmToken,msg)
                                            console.log("Notification sent");
                                            const deleteReminder = await ReminderModel.findOneAndDelete({_id: id})
                                            console.log("reminder deleted");
                                        })

}