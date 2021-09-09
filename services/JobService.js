var _ = require('lodash')
var path = require('path')
var dao = require(path.join(process.cwd(), 'dao/DAO'))
var orm = require('orm')

/**
 * 获取职位列表
 *
 * @param  {[type]}   params     查询条件
 * @param  {Function} cb         回调函数
 */
module.exports.getAllJobs = function (params, cb) {
  var conditions = {}
  if (!params.pagenum || params.pagenum <= 0) return cb('pagenum 参数错误')
  if (!params.pagesize || params.pagesize <= 0) return cb('pagesize 参数错误')

  conditions['columns'] = {}
  if (params.query) {
    conditions['columns']['job_name'] = orm.like('%' + params.query + '%')
  }

  dao.countByConditions('JobModel', conditions, function (err, count) {
    if (err) return cb(err)
    pagesize = params.pagesize
    pagenum = params.pagenum
    pageCount = Math.ceil(count / pagesize)
    offset = (pagenum - 1) * pagesize
    if (offset >= count) {
      offset = count
    }
    limit = pagesize

    // 构建条件
    conditions['offset'] = offset
    conditions['limit'] = limit
    // conditions['only'] = ['id', 'name', 'type']

    dao.list('JobModel', conditions, function (err, jobs) {
      if (err) return cb(err)
      var resultDta = {}
      resultDta['total'] = count
      resultDta['pagenum'] = pagenum
      resultDta['jobs'] = _.map(jobs, function (job) {
        job.company = {
          name: '字节跳动科技有限公司',
          imageUrl:
            'https://img.bosszhipin.com/beijin/upload/com/logo/20210525/77d60eae41e48b90df64951371a7a07a19f97e2c258c6cead07beaf11928d91b.png?x-oss-process=image/resize,w_120,limit_0',
          category: '计算机',
          financingStage: '已上市'
        }
        return _.omit(job)
      })
      cb(err, resultDta)
    })
  })
}
function doGetAllJobs() {}
function getCompanyById(info) {
  return new Promise(function (resolve, reject) {
    if (!info || !info.id || isNaN(info.id)) return reject('公司ID格式不正确')

    dao.show('CompanyModel', id, function (err, company) {
      if (err) return reject('获取公司基本信息失败')
      info['company'] = company
      return resolve(info)
    })
  })
}
