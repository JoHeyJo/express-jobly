"use strict";

const { getQueryValues } = require("./getQueryValues");
const { BadRequestError } = require("../expressError");

const object = {
  minEmployees: "3",
  maxEmployees: "9",
  name: "Dot",
};


describe("getQueryValues", function () {
  test("returns valid data", function () {

    const result = getQueryValues(object);
    
    expect(result).toEqual({
      "queryString": "num_employees > $1 AND num_employees < $2 AND name=$3",
      "values": [
        "3",
        "9",
        "%Dot%",
      ],
    });
  });
});

      "num_employees > $1 AND num_employees < $2 AND UPPER(name) LIKE UPPER($3)", 
      "values"
        "3",
        "9",
        "%Dot%"

        // WHERE num_employees > '100'  AND num_employees < '1000' AND UPPER(name) LIKE UPPER('%her%');