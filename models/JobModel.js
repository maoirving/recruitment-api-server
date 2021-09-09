module.exports = function (db, callback) {
  // 用户模型
  db.define(
    'JobModel',
    {
      id: { type: 'serial', key: true },
      name: String,
      type: ['校园招聘', '社会招聘'],
      salary: String,
      city: String,
      experience: String,
      education: String,
      company_id: Number
    },
    {
      table: 'jobs'
    }
  )
  return callback()
}
