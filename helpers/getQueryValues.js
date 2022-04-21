function getQueryValues(params) {

    let values = [];
    // [minEmployees]
    let filterParams = [];

    //if params[minEmployees] => num_employees > handleVarIdx, push value into value array
    if(params.minEmployees){
      values.push(params.minEmployees)
      filterParams.push(`num_employees > $${values.length}`);
    }
    //if params[maxEmployees] => num_employees < handleVarIdx
    if(params.maxEmployees){
      values.push(params.maxEmployees)
      filterParams.push(`num_employees < $${values.length}`);
    }
    //if params[name] => name = handleVarIdx
    if(params.name){
      values.push("UPPER" + `('%${params.name}%')`)
      filterParams.push(`UPPER(name) LIKE $${values.length}`);
    }

    let queryString;
    
    filterParams.length > 1 ? queryString = filterParams.join(" AND ") : queryString = filterParams[0]
    console.log(queryString);
    console.log(values);

    return { values, queryString }

  }

module.exports = { getQueryValues };

// SELECT * FROM companies WHERE upper(name) LIKE upper('%herna%');