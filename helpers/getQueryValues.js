"use strict";

const { BadRequestError } = require("../expressError");

/** getQueryValues takes in and object of query string parameters,
  checks that given filtering params are valid, parses the incoming
  data, and returns an object containing an SQL query string and corresponding
  values */

function getQueryValues(params) {

  if (params.minEmployees && params.maxEmployees) {
    if (parseInt(params.minEmployees) > parseInt(params.maxEmployees)) {
      throw new BadRequestError;
    }
  }

  let values = [];

  let filterParams = [];

  //if params[minEmployees] => num_employees > $index, push value into value array
  if (params.minEmployees) {
    values.push(params.minEmployees);
    filterParams.push(`num_employees >= $${values.length}`);
  }
  //if params[maxEmployees] => num_employees < $index, push value into array
  if (params.maxEmployees) {
    values.push(params.maxEmployees);
    filterParams.push(`num_employees <= $${values.length}`);
  }
  //if params[name] => UPPER(name) LIKE $index, push UPPER('%name%') in to values array
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

