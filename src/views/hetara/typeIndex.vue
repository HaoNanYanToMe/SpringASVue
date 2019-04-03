<style>
	.dataSource{
		width: 100%;
		height: 100%;
		overflow-y:hidden;
		overflow-x: hidden;
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
				<AutoComplete v-model="formItem.serchName" :clearable="clearable" icon="ios-search" placeholder="请输入要检索的引擎分类名称"
				 style="width: 325px;" @on-change="searchName(formItem.serchName)"></AutoComplete>
				<Select v-model="formItem.isDelete" @on-change="changeDelete" style="width:220px" placeholder="请选择需筛选数据的禁用状态">
					<Option v-for="item in hiddenList" :value="item.value" :key="item.value">{{ item.label }}</Option>
				</Select>
			</FormItem>
			<FormItem style="float:right;">
				<Button type="primary" @click="add">新增引擎分类信息</Button>
			</FormItem>
		</Form>
		<Table :loading="loading" :highlight-row="highlight" @on-row-click="showTableData" stripe :columns="tableColumns"
		 :data="tableData" :height="tableHeight"></Table>
		<Page :total="totalItem" :page-size="pageSize" size="small" show-elevator show-total style="margin:15px 0 0 0;text-align: center;font-size: 14px;"
		 show-sizer :page-size-opts="sizeOpts" @on-change="changeNo" @on-page-size-change="changeSize"></Page>
		<!-- 抽屉-->
		<Drawer :title="drawerData.HETARATYPE_NAME" :closable="false" placement="left" width="650" v-model="drawerLeft">
			<Form :model="drawerData" :label-width="80">
				<FormItem label="备注信息">
					<b style="font-size: 18px;">{{drawerData.HETARATYPE_NOTE}}</b>
				</FormItem>
			</Form>
		</Drawer>
		<Drawer :title="drawerTap" placement="right" width="650" v-model="drawerRight" :mask-closable="false" @on-close="cancel"
		 :styles="styles">
			<Form :model="drawerData" :label-width="80">
				<FormItem label="分类名称">
					<Input v-model="drawerData.HETARATYPE_NAME" placeholder="请输入引擎分类表名称,如:数据检索"></Input>
				</FormItem>
				<FormItem label="是否禁用" :style="drawerData.HETARATYPE_ID ? 'hidden:true' : 'hidden:false'">
					<RadioGroup v-model="drawerData.HETARATYPE_ISDELETE">
						<Radio label="noEnble" @click="drawerData.HETARATYPE_ISDELETE = 0">正常</Radio>
						<Radio label="isEnble" @click="drawerData.HETARATYPE_ISDELETE = 1">禁用</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="备注信息">
					<Input v-model="drawerData.HETARATYPE_NOTE" type="textarea" :autosize="{minRows: 3,maxRows: 8}" placeholder="请输入引擎分类表备注信息,如:用于管理用户信息相关"></Input>
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
	export default {
		data() {
			return {
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
				drawerLeft: false,
				drawerRight: false,
				drawerData: {},
				drawerTap: '编辑',
				isEdit: false,
				styles: {
					height: 'calc(100% - 55px)',
					overflow: 'auto',
					paddingBottom: '53px',
					position: 'static'
				},
				//筛选框
				clearable: true,
				formItem: {
					serchName: '',
					isDelete: ''
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
						title: '引擎分类名称',
						key: 'HETARATYPE_NAME'
					},
					{
						title: '是否禁用',
						key: 'SYSUSER_ISDELETE',
						render: (h, params) => {
							return h('div', [
								h('span', {
									style: {
										color: params.row.HETARATYPE_ISDELETE == 0 ? 'green' : 'red'
									}
								}, params.row.HETARATYPE_ISDELETE == 0 ? '正常' : '禁用')
							]);
						}
					},
					{
						title: '备注',
						key: 'HETARATYPE_NOTE'
					},
					{
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
											this.modelVersion = params.row.HETARATYPE_VERSION + 1
											this.modelId = params.row.HETARATYPE_ID
											this.modelTap = '您将删除：' + params.row.HETARATYPE_NAME + ",数据一旦删除将无法恢复，是否确认无误?"
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
			//删除方法
			remove() {
				var _this = this;
				this.$http.deleteForce(this,
					"HETARATYPE",
					this.modelId,
					1, res => {
						if (res.data.search("成功") != -1) {
							//数据参数重置
							this.isEdit = false
							this.modalType = false
							this.getTableData()
							notices.notice(_this, '操作提示', '引擎分类已删除成功。', 1)
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
			//信息保存
			drawerSubmit() {
				var _this = this;
				if (this.drawerData.HETARATYPE_ID) {
					//修改
					var params = {
						"HETARATYPE_NAME": this.drawerData.HETARATYPE_NAME,
						"HETARATYPE_NOTE": this.drawerData.HETARATYPE_NOTE,
						"HETARATYPE_ISDELETE": this.drawerData.HETARATYPE_ISDELETE == 'isEnble' ? 1 : 0,
					}
					this.$http.updateData(this,
						"HETARATYPE",
						params,
						this.drawerData.HETARATYPE_VERSION + 1,
						this.drawerData.HETARATYPE_ID,
						1, res => {
							if (res.data.search("成功") != -1) {
								notices.notice(_this, '操作提示', '引擎分类:' + this.drawerData.HETARATYPE_NAME + '更新成功。', 1)
								//调用关闭，更新状态参数
								this.cancel();
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
							}
						})
				} else {
					//新增
					var params = {
						"NAME": this.drawerData.HETARATYPE_NAME,
						"NOTE": this.drawerData.HETARATYPE_NOTE,
					}
					this.$http.insertData(this,
						"HETARATYPE",
						params,
						1, res => {
							if (res.data != '') {
								notices.notice(_this, '操作提示', '引擎分类:' + this.drawerData.HETARATYPE_NAME + '新增成功。', 1)
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
				this.drawerTap = '编辑引擎分类'
				this.drawerRight = true
				this.drawerData = data.row
				this.drawerData.HETARATYPE_ISDELETE = this.drawerData.HETARATYPE_ISDELETE == 1 ? 'isEnble' : 'noEnble'
			},
			//打开新增的抽屉
			add() {
				this.isEdit = true
				this.drawerTap = '新增引擎分类'
				this.drawerData = {}
				this.drawerRight = true
				this.drawerData.HETARATYPE_ISDELETE = 'noEnble'
			},
			//打开查询的抽屉
			showTableData(data, index) {
				if (!this.isEdit) {
					this.drawerLeft = true
					this.drawerData = data
				}
			},
			//获取Table表单数据
			getTableData() {
				var _this = this;
				_this.loading = true;
				let params = {
					'HETARATYPE_NAME#LIKE': this.formItem.serchName == '' ? null : '%' + this.formItem.serchName + '%',
					'W!HETARATYPE_ISDELETE#EQ': this.formItem.isDelete == '-1' ? null : this.formItem.isDelete,
				}

				this.$http.selectBase(this,
					"HETARATYPE",
					"HETARATYPE",
					"",
					"HETARATYPE_CREATETIME",
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
