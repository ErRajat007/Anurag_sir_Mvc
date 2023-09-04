const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const JWT = require('./middlewares/jwt');
const role = require('./middlewares/verifyRole');
const { rescheduleReminder } = require('./middlewares/rescheduleReminder');
const apiRouter = require('./routes/mainRoute');
const app = express();

const response = require('./helpers/responses'); 
const message = require('./helpers/messages');

let Port = process.env.PORT || 3000;

// parse requests of content-type - application/json
app.use(bodyParser.json({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// import db connection file
require('./databaseConnection/mongo');

// Add cors
app.use(cors());
app.options('*', cors());
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
});

//for video path load
app.use(express.static(path.join(__dirname, 'public/uploadVideos')));
// for image path load
app.use(express.static(path.join(__dirname, 'public/uploadImages')));

app.use('/', JWT.dcryptApiKey, role.AssignRole);
app.use('/api/', apiRouter);

app.listen(Port, () => {
	rescheduleReminder();
	console.log(`Server Running at port: ${Port}`);
});

app.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({
			code: 401,
			status: false,
			msg: err.name + ': ' + err.message,
		});
	}
});

// throw 404 if URL not found http://54.226.75.2:3000/api/
app.all('*', async function (req, res) {
	return response.notFoundResponse(res, message.errorMsg.pageNotFound);
});
