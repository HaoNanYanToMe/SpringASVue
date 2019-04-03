import axios from 'axios'
import notices from './notice.js'

const TIME_OUT_MS = 60 * 1000 // 默认请求超时时间

const TYPE_ONLY = 1; //默认的接口调用类型（0-需要预处理  1-不需要预处理）

const BASEURL = 'http://127.0.0.1:8088' //默认接口访问地址

var qs = require('qs');
/*
 * @param response 返回数据列表
 */
function handleResults(currenPage, response) {
	var _this = currenPage;
	let remoteResponse = response.data
	var result = {
		success: remoteResponse.executeTag == 1 ? true : false,
		message: remoteResponse.msg,
		data: remoteResponse.executeData
	}
	//没有访问权限
	if (remoteResponse.executeTag == -1) {
		_this.$router.push({
			name: 'error-403'
		});
	}
	//没有登陆状态
	if (remoteResponse.executeTag == 0) {
		_this.$router.push({
			name: 'login-403'
		})
	}
	return result
}

function handleUrl(url) {
	url = BASEURL + url
	return url
}

/*
 * @param data 参数列表
 * @return
 */
function handleParams(data) {
	return data
}

export default {
	//接口报错error
	error(currenPage, exception) {
		if (exception) {
			notices.notice(currenPage, '操作提示', '意料之外的错误' + excption + ',请联系管理员', 3)
		}
	},
	loginAdmin(currenPage, userName, userPwd, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/loginAdmin', qs.stringify({
			"userName": userName,
			"userPwd": userPwd,
		})).then(
			
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				debugger
				this.error(currenPage, exception)
			}
		)
	},
	/*
	 * selectBase方法(基本查询)
	 * @param currenPage 当前页,传入页面this对象即可
	 * @param type 判断是否需否需要对返回的数据进行处理 0-需要,1-不需要
	 * @param response 请求成功时的回调函数
	 * @param exception 异常的回调函数
	 */
	selectBase(currenPage, selTable, tables, columns, sortColumns, sortTypes,
		pageNo, pageSize, data, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/selectBase', qs.stringify({
			"selTable": selTable,
			"tables": tables,
			"data": JSON.stringify(data),
			"columns": columns,
			"sortColumns": sortColumns,
			"sortTypes": sortTypes,
			"pageNo": pageNo,
			"pageSize": pageSize,
		})).then(
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				this.error(currenPage, exception)
			}
		)
	},
	eCharsBase(currenPage, selTable, eCharsType, columns, title, xDataCol, seriesDataCol, legendCol, seriesName,
		sortColumns, sortTypes, data, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/eCharsBase', qs.stringify({
			"selTable": selTable,
			"eCharsType": eCharsType,
			"columns": columns,
			"title": title,
			"xDataCol": xDataCol,
			"legendCol": legendCol,
			"seriesDataCol": seriesDataCol,
			"seriesName": seriesName,
			"sortColumns": sortColumns,
			"sortTypes": sortTypes,
			"data": JSON.stringify(data),
		})).then(
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				this.error(currenPage, exception)
			}
		)
	},
	/*
	 * exFunction(复杂业务逻辑处理)
	 * @param currenPage 当前页,传入页面this对象即可
	 * @param type 判断是否需否需要对返回的数据进行处理 0-需要,1-不需要
	 * @param isBase  数据处理格式(1-查询/暴力删除 2-新增 3-更新/软删除)
	 * @param response 请求成功时的回调函数
	 * @param exception 异常的回调函数
	 */
	exFunction(currenPage, selExTable, functionName, isBase, data, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/exFunction', qs.stringify({
			"selExTable": selExTable,
			"functionName": functionName,
			"isBase": isBase,
			"data": JSON.stringify(data),
		})).then(
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				this.error(currenPage, exception)
			}
		)
	},
	/*
	 * selectById(获取单条信息)
	 * @param currenPage 当前页,传入页面this对象即可
	 * @param type 判断是否需否需要对返回的数据进行处理 0-需要,1-不需要
	 * @param response 请求成功时的回调函数
	 * @param exception 异常的回调函数
	 * [{},{},{}]
	 */
	selectById(currenPage, selTable, tables, columns, selId, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/selectById', qs.stringify({
			"selTable": selTable,
			"tables": tables,
			"columns": columns,
			"selId": selId,
		})).then(
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				this.error(currenPage, exception)
			}
		)
	},
	/**
	 * updateData(更新单条信息)
	 * @param currenPage 当前页,传入页面this对象即可
	 * @param updData  需要更新的数据集合对象
	 * @param version  当前数据version版本+1
	 * @param updId	   需要更新的数据主键ID
	 * @param type 判断是否需否需要对返回的数据进行处理 0-需要,1-不需要
	 */
	updateData(currenPage, updTableName, updData, version, updId, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/updateData', qs.stringify({
			"updTableName": updTableName,
			"updData": JSON.stringify(updData),
			"version": version,
			"updId": updId,
		})).then(
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				this.error(currenPage, exception)
			}
		)
	},
	/**
	 * updateData(更新单条信息)
	 * @param currenPage 当前页,传入页面this对象即可
	 * @param insertTable  	需要新增的数据表名称
	 * @param data  			需要新增的数据集合对象
	 * @param type 判断是否需否需要对返回的数据进行处理 0-需要,1-不需要
	 */
	insertData(currenPage, insertTable, data, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/insertData', qs.stringify({
			"insertTable": insertTable,
			"data": JSON.stringify(data),
		})).then(
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				this.error(currenPage, exception)
			}
		)
	},
	/**
	 * deleteAffair(数据软删除)
	 * @param currenPage 当前页,传入页面this对象即可
	 * @param delTable  	需要执行软删除的数据表名称
	 * @param delId  	需要执行软删除的数据ID
	 * @param version    当前数据的version版本
	 * @param type 判断是否需否需要对返回的数据进行处理 0-需要,1-不需要
	 */
	deleteAffair(currenPage, delTable, delId, version, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/deleteAffair', qs.stringify({
			"delTable": delTable,
			"delId": delId,
			"version": version
		})).then(
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				this.error(currenPage, exception)
			}
		)
	},
	/**
	 * deleteAffair(数据暴力删除)
	 * @param currenPage 当前页,传入页面this对象即可
	 * @param delTable  	需要执行软删除的数据表名称
	 * @param delId  	需要执行软删除的数据ID
	 * @param type 判断是否需否需要对返回的数据进行处理 0-需要,1-不需要
	 */
	deleteForce(currenPage, delTable, delId, type, response, exception) {
		type = TYPE_ONLY == -1 ? type : TYPE_ONLY;
		axios.post(BASEURL + '/deleteForce', qs.stringify({
			"delTable": delTable,
			"delId": delId,
		})).then(
			(result) => {
				if (type == 0) {
					response(handleResults(currenPage, result))
				} else {
					response(result)
				}
			}
		).catch(
			(error) => {
				this.error(currenPage, exception)
			}
		)
	}
}
