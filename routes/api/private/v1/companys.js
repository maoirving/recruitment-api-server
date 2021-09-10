var express = require('express')
var router = express.Router()
var path = require('path')

// 获取验证模块
var authorization = require(path.join(process.cwd(), '/modules/authorization'))

// 通过验证模块获取分类管理
// import {getAllGoods} from '../../../../services/CompanyService'
var companyServ = authorization.getService('CompanyService')

// 职位列表
router.get(
  '/',
  // 验证参数
  function (req, res, next) {
    // 参数验证
    if (!req.query.pagenum || req.query.pagenum <= 0)
      return res.sendResult(null, 400, 'pagenum 参数错误')
    if (!req.query.pagesize || req.query.pagesize <= 0)
      return res.sendResult(null, 400, 'pagesize 参数错误')
    next()
  },
  // 业务逻辑
  function (req, res, next) {
    var conditions = {
      pagenum: req.query.pagenum,
      pagesize: req.query.pagesize
    }

    if (req.query.query) {
      conditions['query'] = req.query.query
    }
    companyServ.getAllCompanys(conditions, function (err, result) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(result, 200, '获取成功')
    })(req, res, next)
  }
)
// 获取公司详情
router.get(
  '/:id',
  // 参数验证
  function (req, res, next) {
    if (!req.params.id) {
      return res.sendResult(null, 400, '公司ID不能为空')
    }
    if (isNaN(parseInt(req.params.id))) return res.sendResult(null, 400, '公司ID必须是数字')
    next()
  },
  // 业务逻辑
  function (req, res, next) {
    companyServ.getCompanyById(req.params.id, function (err, company) {
      if (err) return res.sendResult(null, 400, err)
      return res.sendResult(company, 200, '获取成功')
    })(req, res, next)
  }
)

module.exports = router
