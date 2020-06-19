const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateCheckoutInput(data) {
  let errors = {};
  // Convert empty fields to an empty string so we can use validator functions
  //   data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";

  data.address = !isEmpty(data.address) ? data.address : "";
  data.address2 = !isEmpty(data.address2) ? data.address2 : "";
  data.city = !isEmpty(data.city) ? data.city : "";
  data.state = !isEmpty(data.state) ? data.state : "";
  data.zip = !isEmpty(data.zip) ? data.zip : "";
  // Name checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "email field is required";
  }
  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.address)) {
    errors.address = "Address field is required";
  }
  if (Validator.isEmpty(data.city)) {
    errors.city = "city field is required";
  }
  if (Validator.isEmpty(data.state)) {
    errors.state = "state field is required";
  }
  if (Validator.isEmpty(data.zip)) {
    errors.zip = "zip field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
