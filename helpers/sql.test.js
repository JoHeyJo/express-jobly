"use strict";

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

const jsToSql = {
  firstName: "first_name",
  lastName: "last_name",
  isAdmin: "is_admin",
};

const updateData = {
  firstName: "NewF",
  lastName: "NewF",
  email: "new@email.com",
  isAdmin: true,
};

const noData = {};

describe("sqlForPartialUpdate", function () {
  test("pass: valid data", function () {

    const result = sqlForPartialUpdate(updateData, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4',
      values: ["NewF", "NewF", "new@email.com", true],
    });
  });

  test("fails: when no data passed in", function () {

    try {
      sqlForPartialUpdate(noData, jsToSql);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// test changing order of obj