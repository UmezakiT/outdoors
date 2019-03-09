const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateActivitiesInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.location = !isEmpty(data.location) ? data.location : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Job title field is required";

  }
  if (Validator.isEmpty(data.location)) {
    errors.location = "location field is required";
  }
 
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
