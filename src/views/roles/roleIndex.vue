<style lang="less">
	@import './menu.less';
</style>
<template>
	<div class="menu">
		<div class="menuTree">
			<Tree :data="TreeData" :render="renderContent"></Tree>
		</div>
		<div class="menuForm" :style="cardWidth">
			<Card class="cards">
				<p slot="title" class="title" :style="titleWidth">
					<Icon type="md-list" size='30' />
					{{formItem.NAME}} - 信息设定
					<Button type="success" @click="submitEditCreate" :disabled="formDisable">保存设定</Button>
				</p>
				<Form :model="formItem" :label-width="80" class="cards-form">
					<Divider>权限基础项配置</Divider>
					<FormItem label="权限名称">
						<Input v-model="formItem.VERSION" style="display: none;"></Input>
						<Input v-model="formItem.PID" style="display: none;"></Input>
						<Input v-model="formItem.ID" style="display: none;"></Input>
						<Input v-model="formItem.NAME" placeholder="如:网络运营部{建议使用中文}" :disabled="formDisable"></Input>
					</FormItem>
					<FormItem label="权限简介">
						<Input v-model="formItem.NOTE" placeholder="如:管理用户基础信息{可为空,建议填写权限的用途及功能概述}" :disabled="formDisable"></Input>
					</FormItem>
					<FormItem label="是否锁定">
						<RadioGroup v-model="formItem.ISLOCK">
							<Radio label="isEnble" :disabled="formDisable" @click="formItem.ISLOCK = 1">是</Radio>
							<Radio label="noEnble" :disabled="formDisable" @click="formItem.ISLOCK = 0">否</Radio>
						</RadioGroup>
					</FormItem>
					<FormItem label="是否父级">
						<RadioGroup v-model="formItem.ISTOP">
							<Radio label="isParent" :disabled="formDisable">是</Radio>
							<Radio label="noParent" :disabled="formDisable">否</Radio>
						</RadioGroup>
					</FormItem>
					<FormItem label="权限权重">
						<InputNumber v-model="formItem.SORT" placeholder="如:0{权重将直接影响菜单的顺序排列,请按业务需求进行配置}" :disabled="formDisable"></InputNumber>
					</FormItem>
					<FormItem label="菜单授权">
						<Button type="primary" @click="getDrawer" :disabled="formItem.ID == null ? true : false" style="float: right;">授权菜单访问</Button>
					</FormItem>
				</Form>
			</Card>
		</div>
		<Drawer :title="formItem.NAME + ' - 菜单授权'" v-model="settingCode" width="720" :mask-closable="false" :styles="styles">
			<Divider style="color: chocolate;">#提示：直接勾选授权将视为开放当前菜单全部子权限</Divider>
			<Divider style="color: orchid">#若需指定对应子权限(新增/删除/修改/查询/导出)，请点击
				<Icon type="md-create" />进行后续操作</Divider>
			<Tree :data="MenuTreeData" :render="renderLicense" show-checkbox multiple ref="tree"></Tree>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="settingCode = false" ref='cancel'>取消操作</Button>
				<Button type="primary" @click="drawerSubmit">确认授权</Button>
			</div>
		</Drawer>
		<Drawer :title="currentMenu + ' - 子权限管理'" v-model="settingCode2" width="450" :closable="false" :styles="styles">
			<Form :model="roleMenuData" :label-width="80" class="cards-form">
				<Divider :style="dividerStyle">
					<span style="color: brown;font-weight: bold;margin-right: 10px;">
						<Icon type="logo-buffer" /> 查询</span>
					<RadioGroup v-model="roleMenuData.SEL" style="margin: 0 auto;" @on-change="editRole">
						<Radio label="isSel">允许</Radio>
						<Radio label="noSel">禁止</Radio>
					</RadioGroup>
				</Divider>
				<Divider :style="dividerStyle">
					<span style="color: green;font-weight: bold;margin-right: 10px;">
						<Icon type="md-add" /> 新增</span>
					<RadioGroup v-model="roleMenuData.ADDS" style="margin: 0 auto;" @on-change="editRole">
						<Radio label="isAdd">允许</Radio>
						<Radio label="noAdd">禁止</Radio>
					</RadioGroup>
				</Divider>
				<Divider :style="dividerStyle">
					<span style="color: royalblue;font-weight: bold;margin-right: 10px;">
						<Icon type="md-albums" /> 更新</span>
					<RadioGroup v-model="roleMenuData.EDIT" style="margin: 0 auto;" @on-change="editRole">
						<Radio label="isEdit">允许</Radio>
						<Radio label="noEdit">禁止</Radio>
					</RadioGroup>
				</Divider>
				<Divider :style="dividerStyle">
					<span style="color: red;font-weight: bold;margin-right: 10px;">
						<Icon type="md-close" /> 删除</span>
					<RadioGroup v-model="roleMenuData.DEL" style="margin: 0 auto;" @on-change="editRole">
						<Radio label="isDel">允许</Radio>
						<Radio label="noDel">禁止</Radio>
					</RadioGroup>
				</Divider>
				<Divider :style="dividerStyle">
					<span style="color: darkgoldenrod;font-weight: bold;margin-right: 10px;">
						<Icon type="md-cloud-download" /> 导出</span>
					<RadioGroup v-model="roleMenuData.EXPORTS" style="margin: 0 auto;" @on-change="editRole">
						<Radio label="isExport">允许</Radio>
						<Radio label="noExport">禁止</Radio>
					</RadioGroup>
					</RadioGroup>
				</Divider>
			</Form>
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
	import Cookies from 'js-cookie';
	import notices from '../../notice.js'
	export default {
		data() {
			return {
				currentMenu: '',
				//子权限数据
				roleMenuData: {},
				//页面样式布局统一化
				cardWidth: 'width:1%',
				titleWidth: 'width:1%',
				shrink: false,
				//模态框
				modalType: false,
				modelTap: '',
				//右侧编辑框禁用状态
				formDisable: true,
				//是否为新增
				isNew: false,
				isNewData: {},
				//抽屉
				settingCode: false,
				settingCode2: false,
				formData: {

				},
				styles: {
					height: 'calc(100% - 55px)',
					overflow: 'auto',
					paddingBottom: '53px',
					position: 'static'
				},
				dividerStyle: {
					padding: '10px'
				},
				//Card数据展示页
				formItem: {
					input: '',
					ISTOP: 'noParent',
					ISLOCK: 'noEnble',
					CODE: ''
				},
				//Tree数据
				TreeData: [],
				MenuTreeData: [],
				buttonProps: {
					type: 'default',
					size: 'small',
				},
				thisNode: {
					root: {},
					node: {},
					data: {}
				},
				thisRoleMenuNode:{}
			}
		},
		methods: {
			//子权限变更
			//type : 0 - 查询  1-新增  2-更新  3-删除  4-导出
			editRole(type) {
				var isOrNo = type.indexOf("is")  >= 0 ? 1 : 0;
				type = type.indexOf("Sel") >= 0 ? 0 : type.indexOf("Add") >= 0 ? 1 :
					type.indexOf("Edit") >= 0 ? 2 : type.indexOf("Del") >= 0 ? 3 : type.indexOf("Export") >= 0 ? 4 : -1
				var param = {
					"isOrNo": isOrNo,
					"roleType": type,
					"roleId": this.roleMenuData.RID,
					"menuId": this.roleMenuData.MID,
				}
				var _this = this;
				this.$http.exFunction(this,
					"sysRole",
					"updateRoleMenu",
					1, param, 0, res => {
						if(res.data.result != 1){
							notices.notice(_this, '操作提示', res.data.resultData, 3)
						}else{
							this.$set(this.thisRoleMenuNode, 'checked', true);
							notices.notice(_this, '操作提示', res.data.resultData, 1)
							this.authorizeData(this.roleMenuData.MID)
						}
					})
			},
			//打开授权抽屉
			getDrawer() {
				this.getMenuTreeData(this.formItem.ID);
				this.settingCode = true
			},
			renderLicense(h, {
				root,
				node,
				data
			}) {
				return h('span', {
					style: {
						display: 'inline-block',
						width: '100%',
						cursor: 'pointer'
					}
				}, [
					h('span', [
						h('Icon', {
							props: {
								type: data.id == 0 ? 'ios-menu' : data.isLock ? 'ios-lock' : 'ios-grid-outline',
							},
							style: {
								marginRight: '8px',
							}
						}),
						h('span', {
							style: {
								color: data.isLock ? 'red' : data.isNew ? 'green' : 'black',
								fontSize: '14px'
							},
							on: {
								click: () => {
									this.authorizeNode(data)
								}
							}
						}, data.title),
						h('span', {
							style: {
								display: 'inline-block',
								float: 'right',
								marginRight: '32px'
							}
						}, [
							h('Button', {
								props: Object.assign({}, this.buttonProps, {
									icon: 'md-create',
									disabled: data.isLock,
								}),
								style: {
									marginRight: '8px',
									background: data.id == 0 ? '#2d8cf0' : '#fff',
									width: data.id == 0 ? '100px' : '28px',
									display: data.children ? 'none' : 'display',
								},
								on: {
									click: () => {
										//详细授权
										this.thisRoleMenuNode = data
										this.currentMenu = data.title	
										this.authorizeData(data.id)
									}
								}
							})
						])
					])
				]);
			},
			authorizeData(id) {
				this.settingCode2 = true
				var param = {
					"roleId": this.formItem.ID,
					"menuId": id
				}
				this.$http.exFunction(this,
					"sysRole",
					"selectRoleMenuNodes",
					1, param, 0, res => {
						this.roleMenuData = eval(res.data);
					})
			},
			//授权
			authorizeNode(data) {
				this.$set(data, 'expand', !data.expand);
			},
			//Tree方法
			renderContent(h, {
				root,
				node,
				data
			}) {
				return h('span', {
					style: {
						display: 'inline-block',
						width: '100%',
						cursor: 'pointer'
					}
				}, [
					h('span', [
						h('Icon', {
							props: {
								type: data.id == 0 ? 'ios-folder' : data.isLock ? 'ios-lock' : 'ios-paper'
							},
							style: {
								marginRight: '8px',
							}
						}),
						h('span', {
							style: {
								color: data.isLock ? 'red' : data.isNew ? 'green' : 'black',
								fontSize: '14px'
							},
							on: {
								click: () => {
									this.editCreateNode(data, true)
								}
							}
						}, data.title)
					]),
					h('span', {
						style: {
							display: 'inline-block',
							float: 'right',
							marginRight: '32px'
						}
					}, [
						h('Button', {
							props: Object.assign({}, this.buttonProps, {
								icon: data.id == 0 ? 'md-add' : 'ios-add',
								disabled: this.isNew,
							}),
							style: {
								marginRight: '8px',
								background: data.id == 0 ? '#2d8cf0' : '#fff',
								width: data.id == 0 ? '100px' : '28px'
							},
							on: {
								click: () => {
									this.append(data)
								}
							}
						}),
						h('Button', {
							props: Object.assign({}, this.buttonProps, {
								icon: 'ios-remove',
								disabled: data.id == "-1" ? false : this.isNew,
							}),
							style: {
								marginRight: '8px',
								display: data.id == 0 ? 'none' : '',
							},
							on: {
								click: () => {
									this.thisNode.root = root;
									this.thisNode.node = node;
									this.thisNode.data = data;
									this.isNewData = data;
									this.modalType = true
									this.modelTap = '您将删除：' + node.node.title + ",如该节点下存在子节点将被全部删除，是否确认无误?"
								}
							}
						}),
						h('Button', {
							props: Object.assign({}, this.buttonProps, {
								icon: 'md-create',
								disabled: this.isNew,
							}),
							style: {
								marginRight: '8px',
								display: data.id == 0 ? 'none' : ''
							},
							on: {
								click: () => {	
									this.editCreateNode(data, false)
								}
							}
						}),
					])
				]);
			},
			//Tree 新增节点
			append(data) {
				const children = data.children || [];
				if (this.isNew) {
					notices.notice(_this, '操作警告', '请先保存或删除正在操作的节点数据。', 2)
				} else {
					this.formDisable = false;
					this.isNew = true;
					this.formItem = {};
					this.formItem.PID = data.id;
					this.formItem.ISLOCK = 'noEnble'
					this.formItem.ISTOP = 'noParent'
					children.push({
						title: '新建菜单',
						expand: true,
						isNew: true,
						id: -1
					});
					//展开父节点新增子节点
					this.$set(data, 'expand', true);
					this.$set(data, 'children', children);
					this.isNewData = children[children.length - 1];
				}
			},
			//Tree 删除选中节点
			remove() {
				var _this = this;
				var title = this.thisNode.data.title;
				//删除时需要判断当前节点是否为新建的未保存节点
				if (this.isNewData.version == undefined) {
					this.treeMove(0)
					notices.notice(_this, '操作提示', '权限:' + title + '删除成功', 1)
				} else {
					var param = {
						"ID": this.thisNode.data.id,
						"VERSION": this.thisNode.data.version + 1
					}
					this.$http.exFunction(this,
						"sysRole",
						"removeRoleNode",
						3, param, 0, res => {
							if (res.data.search("成功") != -1) {
								notices.notice(_this, '操作提示', '权限:' + title + '删除成功', 1)
								this.treeMove(1);
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : res.data, 3)
							}
						})
				}
			},
			treeMove(type) {
				this.modalType = false;
				this.formDisable = true;
				this.formItem = {};
				const parentKey = this.thisNode.root.find(el => el === this.thisNode.node).parent;
				const parent = this.thisNode.root.find(el => el.nodeKey === parentKey).node;
				const index = parent.children.indexOf(this.thisNode.data);
				parent.children.splice(index, 1);
				//更新isNew状态
				if (type == 0) {
					this.isNewData = {}
				}
				this.isNew = false;
			},
			//抽屉方法
			drawerSubmit() {
				var mid = "";
				var rid = this.formItem.ID;
				var _this = this;
				//获取选中的数据
				var checked = this.$refs.tree.getCheckedAndIndeterminateNodes();
				for(var i = 0 ; i < checked.length ; i ++){
					mid  += "," + checked[i].id || '-1'
				}
				//组装后台预处理数据
				var params = {
					"mid" : mid,
					"rid" : rid,
				}
				this.$http.exFunction(this,
					"sysRole",
					"editRoleMenu",
					1, params, 0, res => {
						if(res.data.search("成功") != -1){
							notices.notice(_this, '操作提示', res.data, 1)
						}else{
							notices.notice(_this, '操作提示', res.data, 3)
						}
						//模拟点击关闭抽屉
						this.$refs.cancel.$el.click();
					})
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
			//获取Tree数据
			getMenuTreeData(rid) {
				var _this = this;
				let params = {
					"rid" : rid
				}
				this.$http.exFunction(this,
					"sysMenu",
					"getRoleMenuTree",
					1, params, 0, res => {
						_this.MenuTreeData = eval(res.data);
					})
			},
			//编辑数据填充
			editCreateNode(data, isDisable) {
				var _this = this;
				if (data.id != 0) {
					this.formDisable = isDisable;
					this.$http.selectById(this,
						"SYSROLE",
						"",
						"",
						data.id,
						0, res => {
							//赋值
							this.formItem = res.data;
							this.formItem.ISLOCK = this.formItem.ISLOCK == 1 ? 'isEnble' : 'noEnble'
							this.formItem.ISTOP = this.formItem.ISTOP == 1 ? 'isParent' : 'noParent'
							this.$set(data, 'expand', !data.expand);
							//保存Tree树节点用户保存后的实时更新
							this.isNewData = data;
						})
				}
			},
			submitEditCreate() {
				var _this = this;
				//调用后台新增或修改接口
				if (this.isNew) {
					var param = {
						"NAME": this.formItem.NAME,
						"NOTE": this.formItem.NOTE,
						"ISLOCK": this.formItem.ISLOCK == 'isEnble' ? 1 : 0,
						"ISTOP": this.formItem.ISTOP == 'isParent' ? 1 : 0,
						"SORT": this.formItem.SORT,
						"PID": this.formItem.PID == 0 ? -1 : this.formItem.PID,
					}
					//新增
					this.$http.exFunction(this,
						"sysRole",
						"insertRoleNode",
						2, param, 0, res => {
							if (res.data != '') {
								notices.notice(_this, '操作提示', '权限:' + this.formItem.NAME + '新增成功', 1)
								//修改Tree节点信息
								this.$set(this.isNewData, 'title', this.formItem.NAME);
								this.$set(this.isNewData, 'id', res.data.replace("\'",""));
								this.$set(this.isNewData, 'version', 1);
								//解锁授权
								this.formItem.ID = res.data.replace("\'","")
								//锁定编辑区域
								this.formDisable = true;
								//更新isNew状态
								this.isNew = false;
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : '权限:' + this.formItem.NAME + '新增失败', 3)
							}
						})
				} else {
					var param = {
						"ID": this.formItem.ID,
						"VERSION": this.formItem.VERSION + 1,
						"SYSROLE_NAME": this.formItem.NAME,
						"SYSROLE_NOTE": this.formItem.NOTE,
						"SYSROLE_ISLOCK": this.formItem.ISLOCK == 'isEnble' ? 1 : 0,
						"SYSROLE_ISTOP": this.formItem.ISTOP == 'isParent' ? 1 : 0,
						"SYSROLE_SORT": this.formItem.SORT,
						"SYSROLE_PID": this.formItem.PID == 0 ? -1 : this.formItem.PID,
					}
					//编辑
					this.$http.exFunction(this,
						"sysRole",
						"updateRoleNode",
						3, param, 0, res => {
							if (res.data.search("成功") != -1) {
								notices.notice(_this, '操作提示', "权限信息更新成功", 1)
								//修改Tree节点信息
								this.$set(this.isNewData, 'title', this.formItem.NAME);
								this.$set(this.isNewData, 'version', this.formItem.VERSION + 1);
								//锁定编辑区域
								this.formDisable = true;
								//更新isNew状态
								this.isNew = false;
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : '原因:' + res.data, 3)
							}
						})
				}
			},
			setCardWidth(pt) {
				this.cardWidth = 'width:' + ($(document).width() * pt) + "px";
			},
			setTitleWidth(pt) {
				this.titleWidth = 'width:' + ($(document).width() * pt) + "px";
			}
		},
		created() {
			this.getTreeData();
			this.shrink = this.$store.state.app.shrinked;
			this.setCardWidth(this.shrink ? 0.5525 : 0.4625);
			this.setTitleWidth(this.shrink ? 0.5275 : 0.4375);
		},
		computed: {
			getShrink() {
				return this.$store.state.app.shrinked;
			}
		},
		watch: {
			getShrink(curval, oldval) { //监听了computed中getShrink的值，如果发生改变就触发
				var shrink = curval
				shrink = shrink == undefined ? false : shrink
				this.shrink = shrink;
				this.setCardWidth(shrink ? 0.5525 : 0.4625);
				this.setTitleWidth(this.shrink ? 0.5275 : 0.4375);
			}
		},
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
