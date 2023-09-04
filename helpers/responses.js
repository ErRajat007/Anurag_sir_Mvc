/**
 * @method {successResponse} Send a success msg
 * @param {Response object} res
 * @param {Success Mag} msg
 */
exports.successResponse = function (res, msg) {
	var data = { 
		status: 200,
		message: msg,
		data: null,
	};
	return res.status(200).json(data);
};
/**
 * @method {successResponseWithData} Send a success msg
 * @param {Response object} res
 * @param {Message} msg
 * @param {Success data object} data
 */
exports.successResponseWithData = function (res, msg, data) {
	var resData = {
		status: 200,
		message: msg,
		data: data,
	};
	return res.status(200).json(resData);
};
/**
 * @method {ErrorResponse} Send a error msg
 * @param {Response object} res
 * @param {Message} msg
 */
exports.serverErrorResponse = function (res, msg) {
	var data = {
		status: 500,
		message: msg,
		data: null,
	};
	return res.status(500).json(data);
};
/**
 * @method {notFoundResponse} not fount error msg
 * @param {Response object} res
 * @param {Message} msg
 */

exports.notFoundResponse = function (res, msg) {
	var data = {
		status: 404,
		message: msg,
		data: null,
	};
	return res.status(404).json(data);
};
/**
 * @method {unauthorizedResponse} Unauthorized error handle msg
 * @param {Response object} res
 * @param {Message} msg
 */
exports.unauthorizedResponse = function (res, msg) {
	var data = {
		status: 401,
		message: msg,
		data: null,
	};
	return res.status(401).json(data);
};

// TODO Currently we do not passing data oin error response as require at FE side
exports.validationError = function (res, msg) {
	var resData = {
		status: 400,
		message: msg,
		data: null,
	};
	return res.status(400).json(resData);
};
