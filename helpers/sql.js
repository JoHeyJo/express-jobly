const { BadRequestError } = require("../expressError");


/** Takes in two objects: 
 * - dataToUpdate = generic data maipulator
 * - jsToSql = camelCase to snake_case converter
 * Takes camelCase keys of object and converts them to snake_case to match SQL db
 * Returns an object  
 * {
 *                        setCols : '"first_name"=$1, "age"=$2'
 *                        values: [ Bruce, 36 ]
 * }
 * 
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  //keys=[firstName, lastName, password, email, isAdmin]
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    //col=first_name, last_name, age
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,

  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
