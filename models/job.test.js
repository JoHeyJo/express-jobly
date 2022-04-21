// "use strict";

// const db = require("../db.js");
// const { BadRequestError, NotFoundError } = require("../expressError");
// const Company = require("./company.js");
// const {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
// } = require("./_testCommon");

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterEach(commonAfterEach);
// afterAll(commonAfterAll);

// /************************************** create */

// describe("create", function () {
//   const newJob = {
//     tile: "testJob",
//     salary: 999,
//     equity: .012,
//     comp_handle: "c1",
//   };

//   test("create job", async function () {
//     let job = await Job.create(newJob);
//     expect(job).toEqual(newJob);

//     const result = await db.query(
//           `SELECT title, salary, equity, logo_url
//            FROM companies
//            WHERE handle = 'new'`);
//     expect(result.rows).toEqual([
//       {
//         handle: "new",
//         name: "New",
//         description: "New Description",
//         num_employees: 1,
//         logo_url: "http://new.img",
//       },
//     ]);
// });