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
        job.company = GetCompanyInfo(job.company_id)
        return _.omit(job)
      })
      cb(err, resultDta)
    })
  })
}
function GetCompanyInfo(id) {
  return dao.show('CompanyModel', id, function (err, company) {
    // info['company'] = company
    // console.log(company)
    // return company
    return company
  })
}
