module.exports = function (db, callback) {
  // 公司模型
  db.define(
    'CompanyModel',
    {
      id: { type: 'serial', key: true },
      name: String,
      imageUrl: String,
      category: String,
      financingStage: String
    },
    {
      table: 'companys'
    }
  )
  return callback()
}
