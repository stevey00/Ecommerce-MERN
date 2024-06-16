// extends means the "ErrorHandler" and "Error" are the same
class ErrorHandler extends Error{
    constructor(message,statusCode){
// the super keyword is used to access properties on an object literal or classe's [[prototype]], 
// or invoke superclass constructor. super([arguments]), calls the parent constructor and must be 
// called before the "this".
        super(message)
        this.statusCode = statusCode

// "captureStackTrace" This method creates a . stack property on obj that returns a string 
// representing the point in the code at which Error.
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = ErrorHandler