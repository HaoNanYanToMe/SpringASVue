<style>
	.dataSource{
		width: 100%;
		height: 100%;
		overflow-y:hidden;
		overflow-x: hidden;
	}
</style>
<style lang="less" scoped>
	#form-wrap {
		padding: 20px 40px 0px 40px;
		// background-color: white;
		border: solid 1px rgb(244, 244, 244);
	}

	#chart-wrap {
		width: 100%;
		display: flex;
		justify-content: space-between;

		#chart-palette {
			width: 250px;
			margin-right: 30px;
			background-color: white;
			border: solid 1px rgb(244, 244, 244);
		}

		#chart-diagram {
			flex-grow: 1;
			height: 625px;
			background-color: white;
			border: solid 1px rgb(244, 244, 244);
		}
	}

	#lateEntry {
		clear: both;
		background-color: rgb(255, 255, 255);
		border: solid 1px rgb(244, 244, 244);

		>span {
			display: inline-block;
			height: 50px;
			font-size: 16px;
			line-height: 50px;
			text-indent: 30px;
			letter-spacing: 0.8px;
			text-align: left;
			color: rgb(35, 35, 35);
			// border-bottom: 1px solid rgb(234, 234, 234);
		}
	}
</style>

<template>
	<div class="dataSource">
		<!-- 筛选 -->
		<Form inline :model="formItem" style="position:relative;width:100%;margin: 15px 0 0 0;">
			<FormItem>
				<span style="margin-left:15px;">检索内容 ：</span>
			</FormItem>
			<FormItem>
				<AutoComplete v-model="formItem.serchName" :clearable="clearable" icon="ios-search" placeholder="请输入要检索的规则引擎名称"
				 style="width: 325px;" @on-change="searchName(formItem.serchName)"></AutoComplete>
				<Select v-model="formItem.TID" @on-change="changeTypeForm" placeholder="请选择引擎类型" style="width: 275px;">
					<Option v-for="item in typeList" :value="item.HETARATYPE_ID" :key="item.HETARATYPE_ID">{{ item.HETARATYPE_NAME }}</Option>
				</select>
				<Select v-model="formItem.isDelete" @on-change="changeDelete" style="width:175px" placeholder="请选择数据禁用状态">
					<Option v-for="item in hiddenList" :value="item.value" :key="item.value">{{ item.label }}</Option>
				</Select>
			</FormItem>
			<FormItem style="float:right;">
				<Button type="primary" @click="add">新增规则引擎信息</Button>
			</FormItem>
		</Form>
		<Table :loading="loading" :highlight-row="highlight" @on-row-click="showTableData" stripe :columns="tableColumns"
		 :data="tableData" :height="tableHeight"></Table>
		<Page :total="totalItem" :page-size="pageSize" size="small" show-elevator show-total style="margin:15px 0 0 0;text-align: center;font-size: 14px;"
		 show-sizer :page-size-opts="sizeOpts" @on-change="changeNo" @on-page-size-change="changeSize"></Page>
		<!-- 抽屉-->
		<Drawer :title="drawerData.HETARAENGINE_NAME" :closable="false" placement="left" width="650" v-model="drawerLeft">
			<Form :model="drawerData" :label-width="80">
				<FormItem label="唯一编码">
					<b style="font-size: 18px;">{{drawerData.HETARAENGINE_CODE}}</b>
				</FormItem>
				<FormItem label="备注信息">
					<b style="font-size: 18px;">{{drawerData.HETARAENGINE_NOTE}}</b>
				</FormItem>
			</Form>
		</Drawer>
		<!-- goJs流程导图-->
		<Drawer :title="erTitle" placement="right" width="1250" v-model="drawerER" :mask-closable="false" @on-close="cancelER">
			<DIV id="wrap">
				<DIV id="chart-wrap">
					<DIV id="chart-palette"></DIV>
					<DIV id="chart-diagram"></DIV>
				</DIV>
			</DIV>
		</Drawer>

		<Drawer :title="erNodeTitle" placement="right" width="800" v-model="drawerNode" :mask-closable="false" @on-close="cancelNode"
		 :styles="styles">
			<Form :model="formER" :label-width="80">
				<Divider>基础信息</Divider>
				<FormItem label="规则名称">
					<Input v-model="formER.VERSION" style="display: none;"></Input>
					<Input v-model="formER.NAME" placeholder="请输入规则名称,如:数据检索"></Input>
				</FormItem>
				<FormItem label="规则序号">
					<Input v-model="formER.SORT" placeholder="请输入规则序号,如:1,为保证数据一致性,不建议使用相同的序号"></Input>
				</FormItem>
				<FormItem label="唯一编码">
					<Input v-model="formER.CODE" placeholder="请输入规则的唯一编码,如:REGNAME,建议该编码在单引擎下保证其唯一性"></Input>
				</FormItem>
				<FormItem label="是否父级">
					<i-switch size="large" v-model="formER.ISP == 1 ? true:false" @on-change="changeParent">
						<span slot="open">是</span>
						<span slot="close">否</span>
					</i-switch>
				</FormItem>
				<FormItem label="固定节点">
					<i-switch size="large" v-model="formER.ISNECE == 1 ? true:false" @on-change="changeTop">
						<span slot="open">是</span>
						<span slot="close">否</span>
					</i-switch>
				</FormItem>
				<Divider>规则设定</Divider>
				<FormItem label="运算规则">
					<FormItem v-for="eps in formEps" v-if="eps.status" :key="index">
						<Row style="margin-bottom: 5px;">
							<Col span="2" style="margin-right: 5px;">
							<Select :disabled="eps.index == 0 ? true : false" :value="eps.index == 0 ? '0' : eps.addOr" @on-open-change="actIndex = eps.index"
							 @on-change="changeAO">
								<Option value="0">和</Option>
								<Option value="1">或</Option>
							</Select>
							</Col>
							<Col span="4" style="margin-right: 5px;">
							<Input type="text" v-model="eps.name" placeholder="请输入字段名称"></Input>
							</Col>
							<Col span="3" style="margin-right: 5px;">
							<Select :value="eps.condition" @on-change="changeCondition" @on-open-change="actIndex = eps.index">
								<Option value="0">包含</Option>
								<Option value="1">等于(字符串)</Option>
								<Option value="9">等于(数值)</Option>
								<Option value="2">不等于</Option>
								<Option value="3">大于</Option>
								<Option value="4">大于等于</Option>
								<Option value="5">小于</Option>
								<Option value="6">小于等于</Option>
								<Option value="7">正则检索</Option>
								<Option value="8">正则匹配</Option>
							</Select>
							</Col>
							<Col span="7" style="margin-right: 15px;">
							<Input type="text" v-model="eps.value" placeholder="请输入匹配值"></Input>
							</Col>
							<Col span="3" style="margin-right: 5px;">
							<Button @click="handleAdd(eps.index)" icon="md-add">新增</Button>
							</Col>
							<Col span="3" style="margin-right: 5px;">
							<Button @click="handleRemove(eps.index)" icon="md-remove" :disabled="eps.index == 0 ? true : false">移除</Button>
							</Col>
						</Row>
					</FormItem>
					<!-- <Input v-model="formER.EPS" placeholder="请输入需要执行的运算规则,如:reg.regMatchFind('[A-Za-z]+$',classCode)"></Input> -->
				</FormItem>
				<FormItem label="通过执行">
					<Select v-model="formER.TTAG" @on-change="changeIsTrue" style="width:300px;" placeholder="请选择需筛选数据的禁用状态">
						<Option value="E" key="E">终止流程输出结果(E)</Option>
						<Option value="H" key="H">终止流程输出预处理结果(H)</Option>
						<Option value="R" key="R">继续执行下一规则(R)</Option>
						<Option value="C" key="C">对指定字段进行预处理后继续执行下一规则(C)</Option>
						<Option value="S" key="S">终止流程(S)</Option>
					</Select>
					<FormItem style="float: right;" :hidden="formER.TTAG == 'R' || formER.TTAG == 'C' ? false : true">
						<Select v-model="formER.TEXE" :value="formER.TEXE" @on-change="changeTNodes" style="width:350px;">
							<Option v-for="item in formNodes" :value="item.HETARARULES_ID" :key="item.HETARARULES_ID">{{item.HETARARULES_NAME}}</Option>
						</Select>
					</FormItem>
				</FormItem>
				<FormItem :hidden="formER.TTAG == 'R' ? true : false">
					<Input v-model="formER.TEXEMAKE" type="textarea" :autosize="{minRows: 2,maxRows: 8}" placeholder="请输入输出结果"></Input>
				</FormItem>
				<FormItem label="未通过执行">
					<Select v-model="formER.FTAG" @on-change="changeIsFalse" style="width:300px" placeholder="请选择需筛选数据的禁用状态">
						<Option value="E" key="E">终止流程输出结果(E)</Option>
						<Option value="H" key="H">终止流程输出预处理结果(H)</Option>
						<Option value="R" key="R">继续执行下一规则(R)</Option>
						<Option value="C" key="C">对指定字段进行预处理后继续执行下一规则(C)</Option>
						<Option value="S" key="S">终止流程(S)</Option>
					</Select>
					<FormItem style="float: right;" :hidden="formER.FTAG == 'R' || formER.FTAG == 'C' ? false : true">
						<Select v-model="formER.FEXE" :value="formER.FEXE" @on-change="changeFNodes" style="width:350px;">
							<Option v-for="item in formNodes" :value="item.HETARARULES_ID" :key="item.HETARARULES_ID">{{item.HETARARULES_NAME}}</Option>
						</Select>
					</FormItem>
				</FormItem>
				<FormItem :hidden="formER.FTAG == 'R' ? true : false">
					<Input v-model="formER.FEXEMAKE" type="textarea" :autosize="{minRows: 2,maxRows: 8}" placeholder="请输入输出结果"></Input>
				</FormItem>
			</Form>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="cancelNode" ref='cancelNode'>取消操作</Button>
				<Button type="primary" @click="drawerERSubmit">确认操作</Button>
			</div>
		</Drawer>

		<Drawer :title="drawerTap" placement="right" width="650" v-model="drawerRight" :mask-closable="false" @on-close="cancel"
		 :styles="styles">
			<Form :model="drawerData" :label-width="80">
				<FormItem label="引擎名称">
					<Input v-model="drawerData.HETARAENGINE_NAME" placeholder="请输入规则引擎表名称,如:数据检索"></Input>
				</FormItem>
				<FormItem label="唯一编码">
					<Input v-model="drawerData.HETARAENGINE_CODE" placeholder="请输入规则引擎表唯一编码,如:DataParse"></Input>
				</FormItem>
				<FormItem label="引擎分类">
					<Select v-model="drawerData.HETARAENGINE_TID" @on-change="changeType" placeholder="请选择引擎所属分类">
						<Option v-for="item in typeList" :value="item.HETARATYPE_ID" :key="item.HETARATYPE_ID">{{ item.HETARATYPE_NAME }}</Option>
					</Select>
				</FormItem>
				<FormItem label="是否禁用" :style="drawerData.HETARAENGINE_ID ? 'hidden:true' : 'hidden:false'">
					<RadioGroup v-model="drawerData.HETARAENGINE_ISDELETE">
						<Radio label="noEnble" @click="drawerData.HETARAENGINE_ISDELETE = 0">正常</Radio>
						<Radio label="isEnble" @click="drawerData.HETARAENGINE_ISDELETE = 1">禁用</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="备注信息">
					<Input v-model="drawerData.HETARAENGINE_NOTE" type="textarea" :autosize="{minRows: 3,maxRows: 8}" placeholder="请输入规则引擎表备注信息,如:用于管理用户信息相关"></Input>
				</FormItem>
			</Form>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="cancel" ref='cancel'>取消操作</Button>
				<Button type="primary" @click="drawerSubmit">确认操作</Button>
			</div>
		</Drawer>
		<Modal v-model="modalType" width="500px" :mask-closable="false">
			<p slot="header" style="color:#f60;text-align:center">
				<Icon type="ios-information-circle"></Icon>
				<span>操作确认</span>
			</p>
			<div style="text-align:center">
				<p style="font-size: 16px;">{{modelTap.split(",")[0]}}</p>
				<br />
				<p style="font-size: 16px;">{{modelTap.split(",")[1]}}</p>
			</div>
			<div slot="footer">
				<Button type="error" size="large" long @click="remove">确认删除</Button>
			</div>
		</Modal>
	</div>
</template>
<script>
	import notices from '../../notice.js'
	import go from 'gojs'
	const MAKE = go.GraphObject.make;
	let myModel = MAKE(go.GraphLinksModel);
	export default {
		data() {
			return {
				formNodes: [],
				actIndex: 0,
				formEps: [{
					index: 0,
					value: '',
					status: 1,
					condition: 0
				}],
				//ER流程图相关
				currentERNode: {},
				formER: {
					NAME: '',
					ISP: false,
					SORT: 0,
				},
				erNodeTitle: '新建规则',
				erTitle: '',
				eCode: '',
				typeList: [],
				hiddenList: [{
						value: '-1',
						label: '全部'
					},
					{
						value: '1',
						label: '禁用'
					},
					{
						value: '0',
						label: '启用'
					},
				],
				//模态框
				modalType: false,
				modelTap: '',
				modelId: '', //待确认删除的id
				modelVersion: '', //待确认删除的数据version
				//抽屉
				drawerER: false,
				drawerNode: false,
				drawerLeft: false,
				drawerRight: false,
				drawerData: {},
				drawerTap: '编辑',
				isEdit: false,
				styles: {
					height: 'calc(100% - 55px)',
					overflow: 'auto',
					paddingBottom: '53px',
					position: 'static',
					overFlow: 'hidden'
				},
				//筛选框
				clearable: true,
				formItem: {
					serchName: '',
					isDelete: '',
					TID: ''
				},
				//画布渲染状态
				canvasState: false,
				tableHeight: '490',
				//Table数据相关
				loading: true,
				highlight: true,
				totalItem: 0, // 数据总数
				pageSize: 10, // 默认10条
				pageNo: 1, // 默认第一页
				tableData: [],
				sizeOpts: [5, 10, 15, 30],
				tableColumns: [{
						title: '规则引擎名称',
						key: 'HETARAENGINE_NAME'
					},
					{
						title: '是否禁用',
						key: 'SYSUSER_ISDELETE',
						render: (h, params) => {
							return h('div', [
								h('span', {
									style: {
										color: params.row.HETARAENGINE_ISDELETE == 0 ? 'green' : 'red'
									}
								}, params.row.HETARAENGINE_ISDELETE == 0 ? '正常' : '禁用')
							]);
						}
					},
					{
						title: '类型',
						key: 'HETARATYPE1_NAME'
					},
					{
						title: '备注',
						key: 'HETARAENGINE_NOTE'
					},
					{
						title: '操作',
						key: 'action',
						width: 350,
						align: 'center',
						render: (h, params) => {
							return h('div', [
								h('Button', {
									props: {
										type: 'info',
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.edit(params, params.index)
										}
									}
								}, '编辑'),
								h('Button', {
									props: {
										type: 'success',
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.isEdit = true
											this.drawerER = true
											this.currentEngine = params.row.HETARAENGINE_ID
											this.eCode = params.row.HETARAENGINE_CODE
											if (!this.canvasState) {
												this.init() //初始化goJs组件
											} else {
												this.getHetaraNodes(); //重新载入数据
											}
											this.erTitle = params.row.HETARAENGINE_NAME + 'E-R流程导图'
										}
									}
								}, '管理E-R流程导图'),
								h('Button', {
									props: {
										type: 'error',
										size: 'small'
									},
									on: {
										click: () => {
											this.isEdit = true
											this.modalType = true
											this.modelVersion = params.row.HETARAENGINE_VERSION + 1
											this.modelId = params.row.HETARAENGINE_ID
											this.modelTap = '您将删除：' + params.row.HETARAENGINE_NAME + ",数据一旦删除将无法恢复，是否确认无误?"
										}
									}
								}, '删除')
							]);
						}
					}
				]
			}
		},
		methods: {
			//switch按钮变更
			changeParent(status) {
				this.formER.ISP = status ? 1 : 0
			},
			changeTop(status) {
				this.formER.ISNECE = status ? 1 : 0
			},
			changeAO(val) {
				if (this.formEps[this.actIndex - 1 < 0 ? 0 : this.actIndex - 1] != undefined)
					this.formEps[this.actIndex - 1 < 0 ? 0 : this.actIndex - 1].addOr = val
			},
			changeCondition(val) {
				if (this.formEps[this.actIndex - 1 < 0 ? 0 : this.actIndex - 1] != undefined)
					this.formEps[this.actIndex - 1 < 0 ? 0 : this.actIndex - 1].condition = val
			},
			//预处理下拉框数据
			changeIsTrue(val) {
				this.formER.TTAG = val;
			},
			changeIsFalse(val) {
				this.formER.FTAG = val;
			},
			changeTypeForm(val) {
				this.formItem.TID = val
				this.getTableData()
			},
			//选择性别
			changeType(val) {
				this.drawerData.HETARAENGINE_TID = val
			},
			//删除方法
			remove() {
				var _this = this;
				this.$http.deleteForce(this,
					"HETARAENGINE",
					this.modelId,
					1, res => {
						if (res.data.search("成功") != -1) {
							//数据参数重置
							this.isEdit = false
							this.modalType = false
							this.getTableData()
							notices.notice(_this, '操作提示', '规则引擎已删除成功。', 1)
						} else {
							notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
						}
					})
			},
			//关闭抽屉并重置相关属性参数
			cancel() {
				this.isEdit = false
				this.drawerRight = false
				this.getTableData()
			},
			//关闭抽屉并重置相关属性参数
			cancelER() {
				this.isEdit = false
				this.drawerER = false
			},
			//关闭抽屉并重置相关属性参数
			cancelNode() {
				this.formEps = [{
					index: 0,
					value: '',
					status: 1,
					condition: 0
				}]
				this.isEdit = false
				this.drawerNode = false
			},
			//信息保存
			drawerSubmit() {
				var _this = this;
				if (this.drawerData.HETARAENGINE_ID) {
					//修改
					var params = {
						"HETARAENGINE_NAME": this.drawerData.HETARAENGINE_NAME,
						"HETARAENGINE_CODE": this.drawerData.HETARAENGINE_CODE,
						"HETARAENGINE_NOTE": this.drawerData.HETARAENGINE_NOTE,
						"HETARAENGINE_TID": this.drawerData.HETARAENGINE_TID,
						"HETARAENGINE_ISDELETE": this.drawerData.HETARAENGINE_ISDELETE == 'isEnble' ? 1 : 0,
					}
					this.$http.updateData(this,
						"HETARAENGINE",
						params,
						this.drawerData.HETARAENGINE_VERSION + 1,
						this.drawerData.HETARAENGINE_ID,
						1, res => {
							if (res.data.search("成功") != -1) {
								notices.notice(_this, '操作提示', '规则引擎:' + this.drawerData.HETARAENGINE_NAME + '更新成功。', 1)
								//调用关闭，更新状态参数
								this.cancel();
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
							}
						})
				} else {
					//新增
					var params = {
						"NAME": this.drawerData.HETARAENGINE_NAME,
						"NOTE": this.drawerData.HETARAENGINE_NOTE,
						"CODE": this.drawerData.HETARAENGINE_CODE,
						"TID": this.drawerData.HETARAENGINE_TID,
					}
					this.$http.insertData(this,
						"HETARAENGINE",
						params,
						1, res => {
							if (res.data != '') {
								notices.notice(_this, '操作提示', '规则引擎:' + this.drawerData.HETARAENGINE_NAME + '新增成功。', 1)
								//调用关闭，更新状态参数
								this.cancel();
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
							}
						})
				}
			},
			//打开编辑的抽屉
			edit(data, index) {
				this.isEdit = true
				this.drawerTap = '编辑规则引擎'
				this.drawerRight = true
				this.drawerData = data.row
				this.drawerData.HETARAENGINE_ISDELETE = this.drawerData.HETARAENGINE_ISDELETE == 1 ? 'isEnble' : 'noEnble'
			},
			//打开新增的抽屉
			add() {
				this.isEdit = true
				this.drawerTap = '新增规则引擎'
				this.drawerData = {}
				this.drawerRight = true
				this.drawerData.HETARAENGINE_ISDELETE = 'noEnble'
			},
			//打开查询的抽屉
			showTableData(data, index) {
				if (!this.isEdit) {
					this.drawerLeft = true
					this.drawerData = data
				}
			},
			//获取新建规则的序列号
			getNextCount() {
				var _this = this;
				var params = {
					"EID": _this.currentEngine
				}
				this.$http.exFunction(_this,
					"hetara",
					"getNextCount",
					1, params, 1, res => {
						if (res.data != '') {
							this.formER = {
								"ISNECE": 0,
								"ISP": 0,
								"SORT": res.data
							}
						}
					})
			},
			changeTNodes(val) {
				this.formER.TEXE = val
			},
			changeFNodes(val) {
				this.formER.FEXE = val
			},
			//获取Table表单数据
			getTableData() {
				var _this = this;
				_this.loading = true;
				let params = {
					'HETARAENGINE_NAME#LIKE': this.formItem.serchName == '' ? null : '%' + this.formItem.serchName + '%',
					'HETARAENGINE_TID#EQ': this.formItem.TID == '' ? null : this.formItem.TID,
					'W!HETARAENGINE_ISDELETE#EQ': this.formItem.isDelete == '-1' ? null : this.formItem.isDelete,
				}

				this.$http.selectBase(this,
					"HETARAENGINE,HETARATYPE1",
					"HETARAENGINE",
					"HETARATYPE1_NAME",
					"HETARAENGINE_CREATETIME",
					"4",
					_this.pageNo, _this.pageSize,
					params, 1, res => {
						_this.tableData = res.data.data;
						_this.totalItem = res.data.total;
						_this.loading = false;
					})
			},
			//分页方法
			changeNo(n) {
				this.pageNo = n;
				this.getTableData();
			},
			//改变每页显示条数
			changeSize(n) {
				this.pageSize = n;
				this.getTableData();
			},
			//检索方法
			searchName(name) {
				this.formItem = {
					serchName: name,
					isDelete: this.formItem.isDelete
				}
				this.getTableData();
			},
			changeDelete(val) {
				this.formItem = {
					serchName: this.formItem.serchName,
					isDelete: val,
				}
				this.getTableData();
			},
			//设置Table的高度
			setTableHeight() {
				this.tableHeight = ($(window).height() - 233);
			},
			//获取Hetara引擎类型列表
			getType() {
				let params = {
					"HETARATYPE_ISDELETE#EQ": '0',
				}
				this.$http.selectBase(this,
					"HETARATYPE",
					"HETARATYPE",
					"",
					"HETARATYPE_NAME",
					"2",
					1, 999,
					params, 1, res => {
						this.typeList = res.data.data;
					})
			},
			//获取Hetara流程数据
			getHetaraNodes() {
				var _this = this;
				var param = {
					"code": _this.eCode,
				}
				this.$http.exFunction(this,
					"hetara",
					"getHetaraEngine",
					1, param, 1, res => {
						//也可以创建link model;需要配置myModel.linkDataArray 如下
						myModel.nodeDataArray = res.data.nodeData;
						myModel.linkDataArray = res.data.linkData;
					})
			},
			//初始化GoJs以渲染Hetara引擎
			init() {
				var mySelf = this;
				this.getHetaraNodes();
				this.canvasState = true;
				window.myPalette = MAKE(
					go.Palette,
					"chart-palette", // must name or refer to the DIV HTML element
					{
						scrollsPageOnFocus: false,
						initialContentAlignment: go.Spot.Center, // 居中显示
						nodeTemplateMap: mySelf.myDiagram.nodeTemplateMap, // share the templates used by myDiagram
						model: new go.GraphLinksModel([
							// specify the contents of the Palette
							{
								category: "Next",
								text: "新规则"
							},
							{
								category: "Stop",
								text: "结束"
							}
						])
					}
				);
			},
			//ER流程图信息保存
			drawerERSubmit() {
				var _this = this;
				var q = this.formEps;
				var eps = '';
				debugger
				for (var i = 0; i < q.length; i++) {
					if (q[i].name.trim() != '' && q[i].status == 1) {
						eps += ",";
						eps += q[i].addOr == 'undefined' ? "0|||" : q[i].addOr + "|||";
						eps += q[i].name + "|||";
						eps += q[i].condition + "|||";
						eps += q[i].value.replace(",", "，");
					}
				}
				if (eps.length > 5) {
					eps = eps.substring(1, eps.length);
				}
				var params = {
					"ID": null,
					"NAME": _this.formER.NAME,
					"SORT": _this.formER.SORT,
					"CODE": _this.formER.CODE,
					"ISP": _this.formER.ISP ? 1 : 0,
					"EPS": eps.replace("undefined", "0"),
					"TTAG": _this.formER.TTAG,
					"TEXE": _this.formER.TTAG == "C" ? _this.formER.TEXE + "|#|" + _this.formER.TEXEMAKE : _this.formER.TTAG == "R" ?
						_this.formER.TEXE : _this.formER.TEXEMAKE,
					"FTAG": _this.formER.FTAG,
					"FEXE": _this.formER.FTAG == "C" ? _this.formER.FEXE + "|#|" + _this.formER.FEXEMAKE : _this.formER.FTAG == "R" ?
						_this.formER.FEXE : _this.formER.FEXEMAKE,
					"EID": _this.currentEngine,
					"ECODE": _this.eCode,
					"CPTYPE": 1, //竞争模式，暂未开放
					"ISNECE": _this.formER.ISNECE, //是否必要，暂未开放，
					"PID": 0 //新增默认都是0
				}
				//判断-1 执行新增操作
				if (_this.currentERNode.key == -1) {
					this.$http.exFunction(_this,
						"hetara",
						"insertRuleNode",
						1, params, 1, res => {
							if (res.data != '') {
								notices.notice(_this, '操作提示', '规则:' + _this.formER.NAME + '新增成功。', 1)
								//调用关闭，更新状态参数
								//提交更新保存
								myModel.startTransaction("flash");
								myModel.setDataProperty(_this.currentERNode, "text", _this.formER.NAME);
								_this.getHetaraNodes();
								myModel.commitTransaction("flash");
								_this.cancelNode();
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
							}
						})
				} else {
					//执行更新操作
					params.ID = _this.currentERNode.key;
					this.$http.exFunction(_this,
						"hetara",
						"editRuleNode",
						1, params, 1, res => {
							if (res.data != '') {
								notices.notice(_this, '操作提示', '规则:' + _this.formER.NAME + '更新成功。', 1)
								//调用关闭，更新状态参数
								//提交更新保存
								myModel.startTransaction("flash");
								myModel.setDataProperty(_this.currentERNode, "text", _this.formER.NAME);
								_this.getHetaraNodes();
								myModel.commitTransaction("flash");
								_this.cancelNode();
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
							}
						})
				}

			},
			//操作当前选中的节点
			checkNode() {
				//获取当前选中的节点data
				this.currentERNode = this.myDiagram.selection.first().data;
				var key = this.currentERNode.key;

				//连接线不触发编辑操作
				if (key != undefined) {
					this.erNodeTitle = this.currentERNode.text == undefined ? '新增节点' : this.currentERNode.text
					if (this.currentERNode.text != undefined) {
						if (key.length > 2) {
							if (key.split("-")[1] == "T" || key.split("-")[1] == "F") {
								//...
							} else {
								this.isEdit = true
								this.drawerNode = true
								this.getOneNode(this.currentERNode.key)
							}
						} else {
							this.isEdit = true
							this.drawerNode = true
							this.getNextCount();
						}
					}
				}
			},
			//从后台获取当前节点的数据
			getOneNode(id) {
				this.$http.selectById(this,
					"HETARARULES",
					"",
					"",
					id,
					0, res => {
						//赋值
						this.formER = res.data;
						var newArray = new Array();
						var epsList = res.data.EPS.split(",");
						for (var i = 0; i < epsList.length; i++) {
							if (epsList[i].trim() != "")
								var excuteEps = epsList[i].split("|||");
							var nEps = {
								"index": i,
								"status": 1,
								"addOr": excuteEps[0],
								"name": excuteEps[1],
								"condition": excuteEps[2],
								"value": excuteEps[3].replace("，", ","),
							}
							newArray.push(nEps)
						}
						this.formEps = newArray;
						if (res.data.TTAG == "C") {
							this.formER.TEXEMAKE = res.data.TEXE.split("|#|")[1];
						} else {
							this.formER.TEXEMAKE = res.data.TEXE
						}
						if (res.data.FTAG == "C") {
							this.formER.FEXEMAKE = res.data.FEXE.split("|#|")[1];
						} else {
							this.formER.FEXEMAKE = res.data.FEXE
						}
						this.getNodeList();
					})
			},
			handleAdd(index) {
				this.formEps.push({
					"value": '',
					"index": this.formEps.length + 1,
					"status": '1',
					"addOr": '0',
					"name": '',
					"condition": '0',
					"value": '',
				});
			},
			handleRemove(index) {
				this.formEps[index - 1].status = 0;
			},
			getNodeList() {
				var params = {
					"HETARARULES_EID#EQ": this.currentEngine
				}
				this.$http.selectBase(this,
					"HETARARULES",
					"HETARARULES",
					"",
					"HETARARULES_SORT",
					"2",
					1, 999,
					params, 0, res => {
						this.formNodes = res.data.data;
					})
			},
			delNode(id) {
				var _this = this;
				var params = {
					"ID": id,
					"ECODE": _this.eCode,
				}
				this.$http.exFunction(_this,
					"hetara",
					"delRuleNode",
					1, params, 1, res => {
						if (res.data != '') {
							notices.notice(_this, '操作提示', '规则:' + _this.formER.NAME + '删除成功。', 1)
							//调用关闭，更新状态参数
							//提交更新保存
							myModel.startTransaction("flash");
							myModel.setDataProperty(_this.currentERNode, "text", _this.formER.NAME);
							_this.getHetaraNodes();
							myModel.commitTransaction("flash");
							_this.cancelNode();
						} else {
							notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
						}
					})
			}
		},
		created() {
			this.getTableData();
			this.setTableHeight();
			this.getType();
		},
		//启用监听,以监听当前页面高度控制Table的Height值
		mounted() {
			window.onresize = () => {
				return (() => {
					this.setTableHeight();
				})()
			}
			var mySelf = this;
			mySelf.myDiagram = MAKE(go.Diagram, "chart-diagram", {
				initialContentAlignment: go.Spot.Center, // 居中显示
				"undoManager.isEnabled": true, // 支持 Ctrl-Z 和 Ctrl-Y 操作
				"toolManager.hoverDelay": 100, //tooltip提示显示延时
				"toolManager.toolTipDuration": 10000, //tooltip持续显示时间
				// isReadOnly:true,//只读
				"grid.visible": false, //显示网格
				allowMove: true, //允许拖动
				allowDragOut: true,
				allowDelete: true,
				allowCopy: true,
				validCycle: go.Diagram.CycleNotUndirected,
				allowClipboard: true,
				"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom, //有鼠标滚轮事件放大和缩小，而不是向上和向下滚动
				layout: MAKE(go.TreeLayout, {
					angle: 90,
					layerSpacing: 35
				})
			}); //构建gojs对象

			//点击触发
			mySelf.myDiagram.addDiagramListener("ObjectDoubleClicked", function(e) {
				mySelf.checkNode()
			});

			mySelf.myDiagram.addDiagramListener("SelectionDeleted", function(e) {
				e.subject.each(function(n) {
					if (n.data.key != -1 && n.data.key != null) {
						//非未保存节点删除走后台方法
						mySelf.delNode(n.data.key)
					} else {
						if (n.data.key == -1) {
							notices.notice(mySelf, '操作提示', '规则删除成功。', 1)
						}
					}
				});
			})

			//得到从Palette拖过来的节点
			mySelf.myDiagram.addDiagramListener("externalobjectsdropped", function(e) {
				e.subject.each(function(n) {
					mySelf.formEps = [{
						index: 0,
						value: '',
						status: 1
					}];
					mySelf.checkNode();
				});
			})

			mySelf.myDiagram.linkTemplate = MAKE(go.Link, {
					routing: go.Link.AvoidsNodes,
					corner: 10,
					curve: go.Link.JumpOver,
				},
				MAKE(go.Shape, {
					strokeWidth: 2,
					stroke: "MediumTurquoise",
				}),
				MAKE(go.Shape, {
					toArrow: "Standard",
					fill: "Aqua",
					stroke: "blue"
				}), //箭头
				MAKE(go.TextBlock,
					new go.Binding("text", "text")),
				MAKE(go.TextBlock, {
						margin: 20,
						stroke: "Aqua",
						font: "14px sans-serif",
						width: 50,
						wrap: go.TextBlock.WrapDesiredSize
					},
					new go.Binding("text", "linktext")), {
					toolTip: MAKE(go.Adornment, "Auto",
						MAKE(go.Shape, {
							fill: "#FFFFCC"
						}),
						MAKE(go.TextBlock, {
							margin: 4
						}, new go.Binding("text", "text"))
					) // end of Adornment
				}
			);


			var lightText = "whitesmoke";
			mySelf.myDiagram.nodeTemplateMap.add(
				"Next",
				MAKE(
					go.Node,
					"Spot",
					// nodeStyle(),
					MAKE( //声明创建一个新的面板对象,自定义方式可参考mySelf.myDiagram.nodeTemplate
						go.Panel, //表明需要创建一个panel面板对象
						"Auto", //页面布局为自动
						MAKE( //声明构建一个圆角矩形
							go.Shape,
							"RoundedRectangle", {
								fill: "#44CCFF",
								stroke: '#FFF',
								strokeWidth: 1,
								angle: 0
							},
							new go.Binding("figure", "figure") //声明并创建一个新的图形
						),
						MAKE( //声明一个可编辑文本域
							go.TextBlock, {
								font: "12pt Helvetica, Arial, sans-serif",
								stroke: lightText,
								width: 125,
								textAlign: 'center',
								maxSize: new go.Size(360, NaN),
								wrap: go.TextBlock.WrapFit, //文本域换行
								editable: false, //是否可编辑
								margin: 12,
								wrap: go.TextBlock.WrapDesiredSize
							},
							new go.Binding("text").makeTwoWay()
						)
					),
				)
			);

			mySelf.myDiagram.nodeTemplateMap.add(
				"Stop",
				MAKE(
					go.Node,
					"Spot",
					// nodeStyle(),
					MAKE( //声明创建一个新的面板对象,自定义方式可参考mySelf.myDiagram.nodeTemplate
						go.Panel, //表明需要创建一个panel面板对象
						"Auto", //页面布局为自动
						MAKE( //声明构建一个圆角矩形
							go.Shape,
							"RoundedRectangle", {
								fill: "LightCoral",
								stroke: '#FFF',
								strokeWidth: 1,
								angle: 0
							},
							new go.Binding("figure", "figure") //声明并创建一个新的图形
						),
						MAKE( //声明一个可编辑文本域
							go.TextBlock, {
								font: "12pt Helvetica, Arial, sans-serif",
								stroke: lightText,
								width: 125,
								textAlign: 'center',
								maxSize: new go.Size(360, NaN),
								wrap: go.TextBlock.WrapFit, //文本域换行
								editable: false, //是否可编辑
								margin: 12,
								wrap: go.TextBlock.WrapDesiredSize
							},
							new go.Binding("text").makeTwoWay()
						)
					),
				)
			);


			//Node连接线
			function makePort(name, spot, output, input) {
				return MAKE(go.Shape, "Circle", {
					fill: "transparent",
					stroke: null, // this is changed to "white" in the showPorts function
					desiredSize: new go.Size(10, 10),
					alignment: spot,
					alignmentFocus: spot, // align the port on the main Shape
					portId: name, // declare this object to be a "port"
					fromSpot: spot,
					toSpot: spot, // declare where links may connect at this port
					fromLinkable: output,
					toLinkable: input, // declare whether the user may draw links to/from here
					cursor: "pointer" // show a different cursor to indicate potential link point
				});
			};
			mySelf.myDiagram.model = myModel;

		},
		watch: {
			tableHeight(val) {
				if (!this.timer) {
					this.timer = true
					let that = this
					//以定时器优化监听的频繁调用造成的页面卡顿
					setTimeout(function() {
						that.timer = false
					}, 500)
				}
			}
		}
	}
</script>
<style>
	/*抽屉样式*/
	.demo-drawer-footer {
		width: 100%;
		position: absolute;
		bottom: 0;
		left: 0;
		border-top: 1px solid #e8e8e8;
		padding: 10px 16px;
		text-align: right;
		background: #fff;
	}

	.vertical-center-modal {
		display: flex;
		align-items: center;
		justify-content: center;

		.ivu-modal {
			top: 0;
		}
	}
</style>
