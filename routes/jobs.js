"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin } = require("../middleware/auth");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, compHandle }
 *
 * Returns { id, title, salary, equity, compHandle }
 *
 * Authorization required: admin
 */

 router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});



/** GET /  =>
 *   { jobs: [ { title, salary, equity, compHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity if true, filter to jobs that provide a non-zero amount
 *   of equity. If false or not included in the filtering, list all jobs
 *   regardless of equity.
 *
 * Authorization required: none
 */

 router.get("/", async function (req, res, next) {
  if (Object.keys(req.query).length > 0) {
      const jobs = await Job.filter(req.query);
      return res.json({ companies });
  } else {
    const jobs = await Job.findAll();
    return res.json({ jobs });
  }
});


/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, compHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, compHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[id ]  =>  { 	"deleted": {"id": id,
 *		                                "title": title} }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  const job = await Job.remove(req.params.id);
  console.log(job);
  return res.json({ deleted: job });
});


module.exports = router;

