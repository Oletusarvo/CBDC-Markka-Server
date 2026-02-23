module.exports = function createLookupTable(tbl) {
  tbl.increments('id');
  tbl.string('label').notNullable().unique();
};
