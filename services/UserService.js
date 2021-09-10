var path = require('path')
var usersDAO = require(path.join(process.cwd(), 'dao/UserDAO'))
var Password = require('node-php-password')
var logger = require('../modules/logger').logger()

function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string') {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}
/**
 * 获取所有管理员
 * @param  {[type]}   conditions 查询条件
 * 查询条件统一规范
 * conditions
	{
		"query" : 关键词查询,
		"pagenum" : 页数,
		"pagesize" : 每页长度
	}
 * @param  {Function} cb         回调函数
 */
module.exports.getAllManagers = function (conditions, cb) {
  if (!conditions.pagenum) return cb('pagenum 参数不合法')
  if (!conditions.pagesize) return cb('pagesize 参数不合法')

  // 通过关键词获取管理员数量
  usersDAO.countByKey(conditions['query'], function (err, count) {
    key = conditions['query']
    pagenum = parseInt(conditions['pagenum'])
    pagesize = parseInt(conditions['pagesize'])

    pageCount = Math.ceil(count / pagesize)
    offset = (pagenum - 1) * pagesize
    if (offset >= count) {
      offset = count
    }
    limit = pagesize

    usersDAO.findByKey(key, offset, limit, function (err, managers) {
      var retManagers = []
      for (idx in managers) {
        var manager = managers[idx]
        var role_name = manager.role_name
        if (!manager.role_id) {
          role_name = '超级管理员'
        }
        retManagers.push({
          id: manager.mg_id,
          role_name: role_name,
          username: manager.mg_name,
          create_time: manager.mg_time,
          mobile: manager.mg_mobile,
          email: manager.mg_email,
          mg_state: manager.mg_state == 1
        })
      }
      var resultDta = {}
      resultDta['total'] = count
      resultDta['pagenum'] = pagenum
      resultDta['users'] = retManagers
      cb(err, resultDta)
    })
  })
}

/**
 * 创建管理员
 *
 * @param  {[type]}   user 用户数据集
 * @param  {Function} cb   回调函数
 */
module.exports.createManager = function (params, cb) {
  usersDAO.exists(params.username, function (err, isExists) {
    if (err) return cb(err)

    if (isExists) {
      return cb('用户名已存在')
    }

    usersDAO.create(
      {
        username: params.username,
        user_type: params.user_type,
        password: Password.hash(params.password),
        encrypt: 'isNotMD5',
        create_time: parseTime(new Date())
      },
      function (err, manager) {
        if (err) return cb('创建失败')
        result = {
          user_id: manager.user_id,
          username: manager.username,
          user_type: manager.user_type,
          password: manager.password,
          create_time: manager.create_time
        }
        cb(null, result)
      }
    )
  })
}

/**
 * 更新管理员信息
 *
 * @param  {[type]}   params 管理员信息
 * @param  {Function} cb     回调函数
 */
module.exports.updateManager = function (params, cb) {
  usersDAO.update(
    {
      mg_id: params.id,
      mg_mobile: params.mobile,
      mg_email: params.email
    },
    function (err, manager) {
      if (err) return cb(err)
      cb(null, {
        id: manager.mg_id,
        username: manager.mg_name,
        role_id: manager.role_id,
        mobile: manager.mg_mobile,
        email: manager.mg_email
      })
    }
  )
}

/**
 * 通过管理员 ID 获取管理员信息
 *
 * @param  {[type]}   id 管理员 ID
 * @param  {Function} cb 回调函数
 */
module.exports.getManager = function (id, cb) {
  usersDAO.show(id, function (err, manager) {
    if (err) return cb(err)
    if (!manager) return cb('该管理员不存在')
    cb(null, {
      id: manager.mg_id,
      rid: manager.role_id,
      username: manager.mg_name,
      mobile: manager.mg_mobile,
      email: manager.mg_email
    })
  })
}

/**
 * 通过管理员 ID 进行删除操作
 *
 * @param  {[type]}   id 管理员ID
 * @param  {Function} cb 回调函数
 */
module.exports.deleteManager = function (id, cb) {
  usersDAO.destroy(id, function (err) {
    if (err) return cb('删除失败')
    cb(null)
  })
}

/**
 * 为管理员设置角色
 *
 * @param {[type]}   id  管理员ID
 * @param {[type]}   rid 角色ID
 * @param {Function} cb  回调函数
 */
module.exports.setRole = function (id, rid, cb) {
  usersDAO.show(id, function (err, manager) {
    if (err || !manager) cb('管理员ID不存在')

    usersDAO.update({ mg_id: manager.mg_id, role_id: rid }, function (err, manager) {
      if (err) return cb('设置失败')
      cb(null, {
        id: manager.mg_id,
        rid: manager.role_id,
        username: manager.mg_name,
        mobile: manager.mg_mobile,
        email: manager.mg_email
      })
    })
  })
}

module.exports.updateMgrState = function (id, state, cb) {
  usersDAO.show(id, function (err, manager) {
    if (err || !manager) cb('管理员ID不存在')

    usersDAO.update({ mg_id: manager.mg_id, mg_state: state }, function (err, manager) {
      if (err) return cb('设置失败')
      cb(null, {
        id: manager.mg_id,
        rid: manager.role_id,
        username: manager.mg_name,
        mobile: manager.mg_mobile,
        email: manager.mg_email,
        mg_state: manager.mg_state ? 1 : 0
      })
    })
  })
}

/**
 * 管理员登录
 * @param  {[type]}   username 用户名
 * @param  {[type]}   password 密码
 * @param  {Function} cb       回调
 */
module.exports.login = function (username, password, cb) {
  logger.debug('login => username:%s,password:%s', username, password)
  logger.debug(username)
  usersDAO.findOne({ username: username }, function (err, manager) {
    logger.debug(err)
    if (err || !manager) return cb('用户名不存在')

    if (Password.verify(password, manager.password)) {
      cb(null, {
        id: manager.user_id,
        username: manager.username,
        user_type: manager.user_type
      })
    } else {
      return cb('密码错误')
    }
  })
}
