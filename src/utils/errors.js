  
class ValidationError extends Error {
  constructor(message = "") {
    super(message); // Call the parent class constructor with the message
    this.name = "ValidationError"; // Set the error name to the custom name

    // Maintains proper stack trace (only available on V8 engines like Chrome and Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}  
 
module.exports = ValidationError;