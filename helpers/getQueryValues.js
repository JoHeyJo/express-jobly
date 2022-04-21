"use strict";

const { BadRequestError } = require("../expressError");

/** getQueryValues takes in an object of query string parameters,
  checks that given filtering params are valid, parses the incoming
  data, and returns an object containing an SQL query string and corresponding
  values */

function getQueryValues(params) {

  if(!params.minEmployees && !params.maxEmployees && !params.nameLike){
    throw new BadRequestError(`${Object.keys(params)[0]} is invalid.`);
  } else if (params.minEmployees && params.maxEmployees) {
      if (parseInt(params.minEmployees) > parseInt(params.maxEmployees)) {
        throw new BadRequestError("Max employee cannot be more than min employee!");
      }
    }

  let values = [];

  let filterParams = [];

  if (params.minEmployees) {
    values.push(params.minEmployees);
    filterParams.push(`num_employees >= $${values.length}`);
  }
  if (params.maxEmployees) {
    values.push(params.maxEmployees);
    filterParams.push(`num_employees <= $${values.length}`);
  }
  if (params.nameLike) {
    values.push(`%${params.nameLike}%`);
    filterParams.push(`name ILIKE $${values.length}`);
  }

  let queryString;

  filterParams.length > 1
    ? queryString = filterParams.join(" AND ")
    : queryString = filterParams[0];

  return { values, queryString };
}

module.exports = { getQueryValues };

