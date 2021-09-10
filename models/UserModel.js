module.exports = function (db, callback) {
  // 用户模型
  db.define(
    'UserModel',
    {
      user_id: { type: 'serial', key: true },
      username: String,
      user_type: String,
      password: String,
      encrypt: String,
      create_time: String
    },
    {
      table: 'users'
    }
  )
  return callback()
}
