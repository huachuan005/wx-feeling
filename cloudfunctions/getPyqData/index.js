// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 获取朋友圈数据
const db = cloud.database()
// 每次最多获取多少条记录,最大值为100
const MAX_LIMIT = 20
exports.main = async (event, context) => {
  // 先取出集合记录总数
  const countResult = await db.collection('pyq-data').count()
  const total = countResult.total

  // 计算有多少页
  const total_times = Math.ceil(total / MAX_LIMIT)
  let dataArr = []
  let errMsg = ''
  let page = event.page || 1
  let keyTypeNameActiveT = event.keyTypeNameActive || "热门" // 默认热门
  // 取到全部数据
  if (keyTypeNameActiveT === 'ALL') {
    await db.collection('pyq-data')
      .orderBy('_createTime', 'desc')
      // 跳过前几次查询的
      .skip((page - 1) * MAX_LIMIT)
      .limit(MAX_LIMIT)
      .get()
      .then(res => {
        dataArr = dataArr.concat(res.data)
        errMsg = res.errMsg
      })
  } else {
    // 取到部分数据
    await db.collection('pyq-data').where({
      keyTypeArr: keyTypeNameActiveT
    })
      .orderBy('_createTime', 'desc')
      // 跳过前几次查询的
      .skip((page - 1) * MAX_LIMIT)
      .limit(MAX_LIMIT)
      .get()
      .then(res => {
        dataArr = dataArr.concat(res.data)
        errMsg = res.errMsg
      })
  }

  return {
    data: dataArr,
    errMsg: errMsg,
  }
  /*
  以下是官方例子,查询表中所以数据
  */
  // 获取总条数的记录次数
  //  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  // const tasks = []
  // for (let i = 0; i < batchTimes; i++) {
  //   const promise = db.collection('resource').orderBy('dateIssued', 'desc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
  //   tasks.push(promise)
  // }
  // 等待所有
  // return (await Promise.all(tasks)).reduce((acc, cur) => {
  //   return {
  //     data: acc.data.concat(cur.data),
  //     errMsg: acc.errMsg,
  //   }
  // })
}