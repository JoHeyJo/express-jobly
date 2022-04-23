"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related function to jobs */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, compHandle }
   *
   * Returns { id, title, salary, equity, compHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, compHandle }) {
    const result = await db.query(
      `INSERT INTO jobs(
            title,
            salary,
            equity,
            company_handle
            )
           VALUES
             ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "compHandle"`,
      [
        title, salary, equity, compHandle
      ],
    );
    const job = result.rows[0];
    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, compHandle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(`
        SELECT  id,
                title,
                salary,
                equity,
                company_handle AS "compHandle"
        FROM jobs
        ORDER BY title;
      `);
    return jobsRes.rows;
  };


  /** Given a job id, return data about job.
 *
 * Returns { id, title, salary, equity, compHandle }
 *
 * Throws NotFoundError if not found.
 **/

  static async get(id) {
    const jobRes = await db.query(`
        SELECT  id,
                title,
                salary,
                equity,
                company_handle AS "compHandle"
        FROM jobs
           WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity}
   *
   * Returns { title, salary, equity, compHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        title: "title",
        salary: "salary",
        equity: "equity",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${handleVarIdx}
        RETURNING id, title, salary, equity, company_handle AS "compHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id, title`,
      [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async filter(params){

  const { values, queryString } = getJobsQuery(params)

    const jobsRes = await db.query(`
        SELECT  id,
                title,
                salary,
                equity,
                company_handle AS "compHandle"
         FROM jobs
         WHERE ${queryString}
         ORDER BY title`,
      values);

    const jobs = jobsRes.rows;

    return jobs;
  }
}

/** getQueryValues takes in an object of query string parameters,
  checks that given filtering params are valid, parses the incoming
  data, and returns an object containing an SQL query string and corresponding
  values */

function getJobsQuery(params) {

  //title case-insensitive, matches any part of string
  //minSalary filters jobs with at least that salary
  //hasEquity: true - filter jobs w non-zero equity. false - list all jobs
  if(!params.title && !params.minSalary && !params.hasEquity){
    throw new BadRequestError();
  }

  console.log(params.hasEquity)

  let values = [];

  let filterParams = [];

  if (params.minSalary) {
    values.push(params.minSalary);
    filterParams.push(`salary >= $${values.length}`);
  }
  params.hasEquity === "true"
    ? filterParams.push(`equity > 0`) 
    : filterParams.push(`equity >= 0`);
  

  if (params.title) {
    values.push(`%${params.title}%`);
    filterParams.push(`title ILIKE $${values.length}`);
  }

  let queryString;

  filterParams.length > 1
    ? queryString = filterParams.join(" AND ")
    : queryString = filterParams[0];
console.log(queryString, values)
  return { values, queryString };
}

module.exports = Job;
