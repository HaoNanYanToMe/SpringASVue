<style lang="less">
	@import './dataSourceIndex.less';
</style>
<template>
	<div class="dataSource">
		<!-- 筛选 -->
		<Form inline :model="formItem" style="position:relative;width:100%;margin: 15px 0 0 0;">
			<FormItem>
				<span style="margin-left:15px;">检索内容 ：</span>
			</FormItem>
			<FormItem>
				<AutoComplete v-model="formItem.serchName" :clearable="clearable" icon="ios-search" placeholder="请输入要检索的用户姓名/邮箱或所属部门岗位名称"
				 style="width: 325px;" @on-change="searchName(formItem.serchName)"></AutoComplete>
			</FormItem>
			<FormItem style="float:right;">
				<Button type="primary" @click="add">新增用户信息</Button>
			</FormItem>
		</Form>
		<Table :loading="loading" :highlight-row="highlight" @on-row-click="showTableData" stripe :columns="tableColumns"
		 :data="tableData" :height="tableHeight"></Table>
		<Page :total="totalItem" :page-size="pageSize" size="small" show-elevator show-total style="margin:15px 0 0 0;text-align: center;font-size: 14px;"
		 show-sizer :page-size-opts="sizeOpts" @on-change="changeNo" @on-page-size-change="changeSize"></Page>
		<!-- 抽屉-->
		<Drawer :title="drawerData.SYSUSER_EMAIL" :closable="false" placement="left" width="650" v-model="drawerLeft">
			<Form :model="drawerData" :label-width="80">
				<FormItem label="姓名"></b>
					<b style="font-size: 18px;">{{drawerData.SYSUSER_NAME}}</b>
				</FormItem>
				<FormItem label="手机">
					<b style="font-size: 18px;">{{drawerData.SYSUSER_MOBILE}}</b>
				</FormItem>
				<FormItem label="座机">
					<b style="font-size: 18px;">{{drawerData.SYSUSER_PHONE}}</b>
				</FormItem>
				<FormItem label="部门岗位">
					<b style="font-size: 18px;">{{drawerData.SYSROLE1_NAME}}</b>
				</FormItem>
				<FormItem label="用户状态">
					<b style="font-size: 18px;">{{drawerData.SYSUSER_ISDELETE == 0 ? '正常' : '禁用'}}</b>
				</FormItem>
				<FormItem label="信息备注">
					<b style="font-size: 18px;">{{drawerData.SYSUSER_NOTE}}</b>
				</FormItem>
			</Form>
		</Drawer>
		<Drawer :title="drawerTap" placement="right" width="650" v-model="drawerRight" :mask-closable="false" @on-close="cancel"
		 :styles="styles">
			<Form :model="drawerData" :label-width="80">
				<FormItem label="姓名">
					<Input v-model="drawerData.SYSUSER_NAME" placeholder="请输入当前用户的姓名,如:张三,非必填项"></Input>
				</FormItem>
				<FormItem label="邮箱">
					<Input v-model="drawerData.SYSUSER_EMAIL" placeholder="请输入当前用户的企业邮箱,如:zhangsan@xdf.cn"></Input>
				</FormItem>
				<FormItem label="手机">
					<Input v-model="drawerData.SYSUSER_MOBILE" placeholder="请输入当前用户联系方式(手机),如:13800000000"></Input>
				</FormItem>
				<FormItem label="座机">
					<Input v-model="drawerData.SYSUSER_PHONE" placeholder="请输入当前用户联系方式(座机),如:010-8788788"></Input>
				</FormItem>
				<FormItem label="部门岗位">
					<Input v-model="drawerData.SYSROLE1_NAME" style="width: 82.5%;" disabled="disabled" placeholder="请点击角色授权为当前用户赋予角色权限,如:系统运维1组"></Input>
					<Button type="primary" @click="addRole">角色授权</Button>
				</FormItem>
				<FormItem label="是否禁用">
					<RadioGroup v-model="drawerData.SYSUSER_ISDELETE">
						<Radio label="noEnble" @click="drawerData.SYSUSER_ISDELETE = 0">正常</Radio>
						<Radio label="isEnble" @click="drawerData.SYSUSER_ISDELETE = 1">禁用</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="信息备注">
					<Input v-model="drawerData.SYSUSER_NOTE" type="textarea" :autosize="{minRows: 2,maxRows: 6}" placeholder="请输入当前用户的备注信息,如:负责系统模块的运维"></Input>
				</FormItem>
			</Form>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="cancel" ref='cancel'>取消操作</Button>
				<Button type="primary" @click="drawerSubmit">确认操作</Button>
			</div>
		</Drawer>
		<Drawer :title="currentRole" placement="right" width="450" v-model="drawerRole" :mask-closable="false" @on-close="cancelRole"
		 :styles="styles">
			<Tree :data="TreeData" ref="tree" @on-select-change="changeRoleTap"></Tree>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="cancelRole">取消操作</Button>
				<Button type="primary" @click="drawerRoleSub" :disabled="roleDisabled">确认操作</Button>
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
	import moment from 'moment';
	export default {
		data() {
			return {
				//模态框
				modalType: false,
				modelTap: '',
				modelId: '', //待确认删除的id
				modelVersion: '', //待确认删除的数据version
				//抽屉
				drawerLeft: false,
				drawerRight: false,
				drawerRole: false,
				drawerData: {},
				drawerTap: '编辑',
				currentRole: '',
				roleDisabled: true,
				//用于编辑及保存数据使用
				currentRoleId: '',
				isEdit: false,
				styles: {
					height: 'calc(100% - 55px)',
					overflow: 'auto',
					paddingBottom: '53px',
					position: 'static'
				},
				TreeData: [],
				//筛选框
				clearable: true,
				formItem: {
					serchName: ''
				},
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
						title: '姓名',
						key: 'SYSUSER_NAME'
					},
					{
						title: '邮箱',
						key: 'SYSUSER_EMAIL'
					},
					{
						title: '部门岗位',
						key: 'SYSROLE1_NAME'
					},
					{
						title: '是否禁用',
						key: 'SYSUSER_ISDELETE',
						render: (h, params) => {
							return h('div', [
								h('span', {
									style: {
										color: params.row.SYSUSER_ISDELETE == 0 ? 'green' : 'red'
									}
								}, params.row.SYSUSER_ISDELETE == 0 ? '正常' : '禁用')
							]);
						}
					}, {
						title: '最后访问IP',
						key: 'SYSUSER_LASTIP'
					}, {
						title: '最后访问时间',
						key: 'SYSUSER_DATETIME',
						render: (h, params) => {
							return h('div', [
								h('span', moment(params.row.SYSUSER_DATETIME).format("YYYY-MM-DD HH:mm:ss"))
							]);
						}
					}, {
						title: '操作',
						key: 'action',
						width: 250,
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
											this.currentRole = this.drawerData.SYSROLE1_NAME
											this.currentRoleId = this.drawerData.SYSUSER_RID
											this.drawerData.SYSUSER_ISDELETE = this.drawerData.SYSUSER_ISDELETE == 1 ? 'isEnble' : 'noEnble'
										}
									}
								}, '编辑'),
								h('Button', {
									props: {
										type: 'error',
										size: 'small'
									},
									on: {
										click: () => {
											this.isEdit = true
											this.modalType = true
											this.modelVersion = params.row.SYSUSER_VERSION + 1
											this.modelId = params.row.SYSUSER_ID
											this.modelTap = '您将删除用户：' + params.row.SYSUSER_NAME + ",数据一旦删除将无法恢复，是否确认无误?"
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
			//变更授权tap提示框数据
			changeRoleTap() {
				var checked = this.$refs.tree.getSelectedNodes();
				this.currentRole = checked.length > 0 ? checked[0].id != '0' ? checked[0].title : '未授权' : this.drawerData.SYSROLE1_NAME
				this.currentRoleId = checked.length > 0 ? checked[0].id : '0'
				this.roleDisabled = this.currentRole == '未授权' ? true : false
			},
			//删除方法
			remove() {
				var _this = this;
				this.$http.deleteForce(this,
					"SYSUSER",
					this.modelId,
					0, res => {
						if (res.data.search("成功") != -1) {
							//数据参数重置
							this.isEdit = false
							this.modalType = false
							this.getTableData()
							notices.notice(_this, '操作提示', '用户已删除成功。', 1)
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
			//关闭授权抽屉
			cancelRole() {
				this.drawerRole = false
			},
			//保存并同步已选的权限信息
			drawerRoleSub() {
				var checked = this.$refs.tree.getSelectedNodes();
				this.drawerData.SYSUSER_RID = checked.length > 0 ? checked[0].id : this.drawerData.SYSUSER_RID
				this.drawerData.SYSROLE1_NAME = checked.length > 0 ? checked[0].title : this.drawerData.SYSROLE1_NAME
				this.cancelRole()
			},
			//信息保存
			drawerSubmit() {
				var _this = this;
				if (this.drawerData.SYSUSER_ID) {
					//修改
					var params = {
						"SYSUSER_NAME": this.drawerData.SYSUSER_NAME,
						"SYSUSER_EMAIL": this.drawerData.SYSUSER_EMAIL,
						"SYSUSER_MOBILE": this.drawerData.SYSUSER_MOBILE,
						"SYSUSER_PHONE": this.drawerData.SYSUSER_PHONE,
						"SYSUSER_ISDELETE": this.drawerData.SYSUSER_ISDELETE == 'isEnble' ? 1 : 0,
						"SYSUSER_RID": this.currentRoleId,
						"SYSUSER_NOTE": this.drawerData.SYSUSER_NOTE
					}
					this.$http.updateData(this,
						"SYSUSER",
						params,
						this.drawerData.SYSUSER_VERSION + 1,
						this.drawerData.SYSUSER_ID,
						0, res => {
							if (res.data.search("成功") != -1) {
								notices.notice(_this, '操作提示', '用户:' + this.drawerData.SYSUSER_NAME + '信息更新成功。', 1)
								//调用关闭，更新状态参数
								this.cancel();
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
							}
						})
				} else {
					//新增
					var params = {
						"NAME": this.drawerData.SYSUSER_NAME,
						"EMAIL": this.drawerData.SYSUSER_EMAIL,
						"MOBILE": this.drawerData.SYSUSER_MOBILE,
						"PHONE": this.drawerData.SYSUSER_PHONE,
						"RID": this.currentRoleId,
						"NOTE": this.drawerData.SYSUSER_NOTE
					}
					this.$http.insertData(this,
						"SYSUSER",
						params,
						0, res => {
							if (res.data != '') {
								notices.notice(_this, '操作提示', '用户:' + this.drawerData.SYSUSER_NAME + '新增成功。', 1)
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
				this.drawerTap = '编辑系统用户信息'
				this.drawerRight = true
				this.drawerData = data.row
			},
			//打开新增的抽屉
			add() {
				this.isEdit = true
				this.drawerTap = '新增系统用户信息'
				this.drawerData.SYSUSER_ISDELETE = 'noEnble'
				this.drawerData = {}
				this.drawerRight = true
			},
			//打开授权的抽屉
			addRole() {
				this.getTreeData()
				this.drawerRole = true
				this.currentRole = this.currentRole || '未授权'
			},
			//打开查询的抽屉
			showTableData(data, index) {
				if (!this.isEdit) {
					this.drawerLeft = true
					this.drawerData = data
				}
			},
			//获取Tree数据
			getTreeData() {
				var _this = this;
				let params = {}
				this.$http.exFunction(this,
					"sysRole",
					"getRoleTree",
					1, params, 0, res => {
						_this.TreeData = eval(res.data);
					})
			},
			//获取Table表单数据
			getTableData() {
				var _this = this;
				_this.loading = true;
				let params = {
					"W!SYSUSER_NAME#LIKE": this.formItem.serchName == '' ? null : '%' + this.formItem.serchName + '%',
					"O!SYSUSER_EMAIL#LIKE": this.formItem.serchName == '' ? null : '%' + this.formItem.serchName + '%',
					"O!SYSROLE1_NAME#LIKE": this.formItem.serchName == '' ? null : '%' + this.formItem.serchName + '%',
				}
				this.$http.selectBase(this,
					"SYSUSER,SYSROLE1",
					"SYSUSER",
					"SYSROLE1_NAME",
					"SYSUSER_DATETIME",
					"4",
					_this.pageNo, _this.pageSize,
					params, 0, res => {
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
					serchName: name
				}
				this.getTableData();
			},
			//设置Table的高度
			setTableHeight() {
				this.tableHeight = ($(window).height() - 233);
			}
		},
		created() {
			this.getTableData();
			this.setTableHeight();
		},
		//启用监听,以监听当前页面高度控制Table的Height值
		mounted() {
			const that = this
			window.onresize = () => {
				return (() => {
					this.setTableHeight();
				})()
			}
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
