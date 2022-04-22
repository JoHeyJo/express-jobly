"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "testJob",
    salary: 999,
    equity: 0.012,
    compHandle: "c1",
  };

  test("create job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
        title: "testJob",
        salary: 999,
        equity: "0.012",
        compHandle: "c1",
        id: expect.any(Number),
      },);

    const result = await db.query(
          ` SELECT title, 
                    salary, 
                    equity, 
                    company_handle
            FROM jobs
            WHERE title = 'testJob'`);

    expect(result.rows).toEqual([
      {
        title: "testJob",
        salary: 999,
        equity: "0.012",
        company_handle: "c1",
      },
    ]);
  }); 
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: 100,
        equity: "0.010",
        compHandle: "c1",
      },
      {
        title: "j2",
        salary: 200,
        equity: "0.020",
        compHandle: "c2",
      },
      {
        title: "j3",
        salary: 300,
        equity: "0.030",
        compHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works: get job", async function () {
    let job = await Job.get("j1");
    expect(job).toEqual({
      title: "j1",
      salary: 100,
      equity: "0.010",
      compHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
    title: "updatedTitle",
    salary: 500,
    equity: "0.050",
  };

  test("works", async function () {
    let job = await Job.update("j1", updateData);
    expect(job).toEqual({
      compHandle: "c1", // why is comp handle being returned here?
      ...updateData,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'updatedTitle'`);
    expect(result.rows).toEqual([{
      company_handle: "c1",
      salary: 500,
      equity: "0.050",
      title: "updatedTitle",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };

    let job = await Job.update("j1", updateDataSetNulls);
    console.log(">>>>>>>>",job)
    expect(job).toEqual({
      compHandle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'New'`);
    expect(result.rows).toEqual([{
      company_handle: "c1",
      title: "New",
      salary: null,
      equity: null,
    }]);
  });

    test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("j1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
  
/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("j1");
    const res = await db.query(
        "SELECT title FROM jobs WHERE title='j1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
});