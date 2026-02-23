const path = require('path');
const fs = require('fs/promises');
module.exports.loadSql = async function (filename) {
  const filepath = path.join(__dirname, `../sql/${filename}`);
  const sql = await fs.readFile(filepath, {
    encoding: 'utf-8',
  });
  return sql;
};
