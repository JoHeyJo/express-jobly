"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "testJob",
    salary: 999,
    equity: 0.012,
    compHandle: "c1",
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        title: "testJob",
        salary: 999,
        equity: "0.012",
        compHandle: "c1",
        id: expect.any(Number),
      },
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        equity: 0.02,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "testJob",
        salary: 999,
        equity: 1.2,
        compHandle: "c1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized with non admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 30,
          equity: "0.012",
          compHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "j4",
          salary: 10,
          equity: "0",
          compHandle: "c3",
        }],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs?queryfilters */

describe("GET /jobs? with query filters", function () {
  test("ok with minSalary", async function () {
    const resp = await request(app).get("/jobs?minSalary=10");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 30,
          equity: "0.012",
          compHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "j4",
          salary: 10,
          equity: "0",
          compHandle: "c3",
        }],
    });
  });
 
  test("ok with minSalary above 500", async function () {
    const resp = await request(app).get("/jobs?minSalary=500");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        }],
    });
  });

  test("returns no results if no job found(minSalary)", async function () {
    const resp = await request(app).get("/jobs?minSalary=99999");
    expect(resp.body).toEqual({ jobs: [] });
  });


    
  test("ok with hasEquity set to false, returns all jobs ", async function () {
    const resp = await request(app).get("/jobs?hasEquity=false");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 30,
          equity: "0.012",
          compHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "j4",
          salary: 10,
          equity: "0",
          compHandle: "c3",
        }],
    });
  });

   test("ok with hasEquity set to true, returns jobs with equity(greater than 0) ", async function () {
    const resp = await request(app).get("/jobs?hasEquity=true");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 30,
          equity: "0.012",
          compHandle: "c2",
        }],
    });
  });

  test("ok with specific title", async function () {
    const resp = await request(app).get("/jobs?title=j1");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        }],
    });
  });

   test("ok with non-specific/partial title", async function () {
    const resp = await request(app).get("/jobs?title=j");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 30,
          equity: "0.012",
          compHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "j4",
          salary: 10,
          equity: "0",
          compHandle: "c3",
        }],
    });
  });

    test("ok with case-insensitive title", async function () {
    const resp = await request(app).get("/jobs?title=J1");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        }],
    });
  });

  test("returns no results if no job found(title)", async function () {
    const resp = await request(app).get("/jobs?title=nope");
    expect(resp.body).toEqual({ jobs: [] });
  });

  test("ok with all parameters", async function () {
    const resp = await request(app).get("/jobs?title=j&minSalary=500&hasEquity=true");
    expect(resp.body).toEqual({
      jobs:
        [{
          id: expect.any(Number),
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
        }],
    });
  });


  test("ok with invalid query string", async function () {
    const resp = await request(app).get("/jobs?nope=nope");
    expect(resp.statusCode).toEqual(400);
  });

  test("ok with invalid minSalary", async function () {
    const resp = await request(app).get("/jobs?minSalary=nope");
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
          id: 1,
          title: "j1",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/5`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for job", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
          id: 1,
          title: "j1-new",
          salary: 999,
          equity: "0.012",
          compHandle: "c1",
      },
    });
  });
  
    test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

    test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/5`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

    test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        compHandle: "j1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

    test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        equity: 1.1,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

    test("unauthorized with non admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

  /************************************** DELETE /companies/:handle */

  describe("DELETE /jobs/:id", function () {
    test("works for jobs", async function () {
      const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${adminToken}`);
      expect(resp.body).toEqual({ deleted: {id: 1,title: "j1" }});
    });

      test("unauth for anon", async function () {
      const resp = await request(app)
        .delete(`/jobs/1`);
      expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such job", async function () {
      const resp = await request(app)
        .delete(`/jobs/5`)
        .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });

    test("unauthorized with non admin", async function () {
      const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
});