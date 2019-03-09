const isEmpty = value => 
  
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).lenght === 0) ||
    (typeof value === "string" && value.trim().lenght === 0);

module.exports = isEmpty;