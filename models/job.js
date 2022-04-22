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
   * Returns { title, salary, equity, compHandle }
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
        SELECT title, 
                salary, 
                equity, 
                company_handle AS "compHandle"
        FROM jobs 
        ORDER BY title;
      `)
      return jobsRes.rows;
    };

    /** Given a job title, return data about job.
   *
   * Returns { title, salary, equity, compHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(title) {
    const jobRes = await db.query(`
        SELECT title, 
                salary, 
                equity, 
                company_handle AS "compHandle"
        FROM jobs 
           WHERE title = $1`,
      [title]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

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

  static async update(title, data) {
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
        WHERE title = ${handleVarIdx}
        RETURNING title, salary, equity, company_handle AS "compHandle"`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(title) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
      [title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }


}

module.exports = Job;
