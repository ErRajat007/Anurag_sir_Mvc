const { roles } = require('../helpers/roleConfig');
const response = require('../helpers/responses')
const message = require('../helpers/messages') 

const Role = {
    AssignRole : async ( req, res , next) => {
        try {
            const url = req.originalUrl;
            let splitURL = url.toString().split("?"); 
           
            const currentUser = req.currentUser;
        
                if (currentUser == null) {
                    if ( roles.All.includes(splitURL[0]) ) {
                        next()
                    }else {
                        return response.unauthorizedResponse(res, message.errorMsg.permissionDenied)
                    }
                }else {
                    if( currentUser.role == "Admin" ){
                        if( roles.Admin.includes(splitURL[0]) || roles.All.includes(splitURL[0])) {
                           next();
                        }else {
                            return response.unauthorizedResponse(res, message.errorMsg.permissionDenied)
                        }
                    } else   {
                        if( roles.User.includes(splitURL[0]) || roles.All.includes(splitURL[0])) {
                            next();
                        }else {
                            return response.unauthorizedResponse(res, message.errorMsg.permissionDenied)
                        }
                    } 
                }
        } catch (error) {
            return response.serverErrorResponse(res, message.errorMsg.serverError)
            
            
        }

    }
}

module.exports = Role;