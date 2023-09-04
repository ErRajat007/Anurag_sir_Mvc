const JWT = require('jsonwebtoken');
const UserModel = require('../models/user');

const response = require('../helpers/responses');
const message = require('../helpers/messages');

const tools = {
	dcryptApiKey: async (req, res, next) => {
		try {
			
			const { authorization } = req.headers;
			if (!authorization || authorization === 'null') {
				req.currentUser = null;
				return next();
			}
			const decodedKey = await JWT.verify(authorization, process.env.JWT_SECRET);
			
			if (
				typeof decodedKey === 'undefined' ||
				typeof decodedKey._id === 'undefined'
			) {
				req.currentUser = null;
				return next();
			}

			const { _id } = decodedKey;
			const user = await UserModel.findOne({ _id: _id });

			if (!user || !user._id) {
				req.currentUser = null;
				return next();
			}

			req.currentUser = user;
			return next();
		} catch (error) {
			return response.unauthorizedResponse(res, error.message);
		}
	},
};

module.exports = tools;
