"use strict";

const { getQueryValues } = require("./getQueryValues");
const { BadRequestError } = require("../expressError");

const object = {
  minEmployees: "500",
  maxEmployees: "1000",
  name: "Dot",
};

describe("getQueryValues", function () {
  test("returns valid data", function () {

    const result = getQueryValues(object);
    expect(result).toEqual({
      "queryString": "num_employees > $1 AND num_employees < $2 AND UPPER(name) LIKE $3",
      "values": [
        "500",
        "1000",
        "UPPER('%Dot%')",
      ],
    });
  });


});



        // SELECT handle,
        //         name,
        //         description,
        //         num_employees AS "numEmployees",
        //         logo_url AS "logoUrl"
        //    FROM companies
        //    WHERE UPPER(name) LIKE UPPER('%hern%')
        //    ORDER BY name;