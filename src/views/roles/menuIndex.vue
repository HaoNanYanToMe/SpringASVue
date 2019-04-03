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
					{{formItem.TITLE}} - 信息设定
					<Button type="success" @click="submitEditCreate" :disabled="formDisable">保存设定</Button>
				</p>
				<Form :model="formItem" :label-width="80" class="cards-form">
					<Divider>基本信息配置</Divider>
					<FormItem label="菜单名称">
						<Input v-model="formItem.TITLE" placeholder="如:用户信息管理{建议使用中文}" :disabled="formDisable"></Input>
					</FormItem>
					<FormItem label="菜单简介">
						<Input v-model="formItem.CONTENT" placeholder="如:管理用户基础信息{可为空,建议填写菜单的用途及功能概述}" :disabled="formDisable"></Input>
					</FormItem>
					<FormItem label="Icon图标">
						<Input v-model="formItem.ICON" style="width: 83.5%;" placeholder="如:ios-add{点击右侧按钮可以查询目前可用的icon图标url,复制指定type即可}"
						 :disabled="formDisable"></Input>
						<Button type="primary" @click="goIview" :disabled="formDisable">图标检索</Button>
					</FormItem>
					<FormItem label="是否锁定">
						<RadioGroup v-model="formItem.ISLOCKED">
							<Radio label="isEnble" :disabled="formDisable" @click="formItem.ISLOCKED = 1">是</Radio>
							<Radio label="noEnble" :disabled="formDisable" @click="formItem.ISLOCKED = 2">否</Radio>
						</RadioGroup>
					</FormItem>
					<Divider>动态路由信息配置</Divider>
					<FormItem label="是否父级">
						<RadioGroup v-model="formItem.ISPARENT">
							<Radio label="isParent" :disabled="formDisable">是</Radio>
							<Radio label="noParent" :disabled="formDisable">否</Radio>
						</RadioGroup>
					</FormItem>
					<FormItem label="路由权重">
						<InputNumber v-model="formItem.SORT" placeholder="如:0{权重将直接影响菜单的顺序排列,请按业务需求进行配置}" :disabled="formDisable"></InputNumber>
					</FormItem>
					<FormItem label="路由名称">
						<Input v-model="formItem.NAME" placeholder="如:customer_index{不可为空,对应路由title字段,建议使用路由页面文件名称+_index}" :disabled="formDisable"></Input>
					</FormItem>
					<FormItem label="访问地址">
						<Input v-model="formItem.PATH" placeholder="如:rolePage{不可为空,对应路由的path字段}" :disabled="formDisable"></Input>
					</FormItem>
					<FormItem label="路由路径">
						<Input v-model="formItem.COMPONENT" placeholder="如:roles/customer{不可为空,对应路由component字段,一般为路由页面的路径,文件夹/文件}"
						 :disabled="formDisable"></Input>
						<Input v-model="formItem.VERSION" style="display: none;"></Input>
						<Input v-model="formItem.PID" style="display: none;"></Input>
						<Input v-model="formItem.ID" style="display: none;"></Input>
					</FormItem>
					<FormItem label="数据权限">
						<Input v-model="formItem.CODE" type="textarea" :autosize="{minRows: 2,maxRows: 6}" readonly="readonly" style="width: 83.5%;"
						 placeholder="点击右侧按钮以配置此菜单可以访问的数据表权限" :disabled="formDisable"></Input>
						<Button type="primary" @click="getDrawer" :disabled="formDisable">权限设定</Button>
					</FormItem>
				</Form>
			</Card>
		</div>
		<Drawer :title="formItem.TITLE ? formItem.TITLE + ' - 数据权限设定' : '新建菜单 - 数据权限设定'" v-model="settingCode" width="720"
		 :mask-closable="false" :styles="styles">
			<Transfer :data="data3" :target-keys="targetKeys3" :list-style="listStyle" :render-format="render3" :operations="['取消授权','数据授权']"
			 filterable @on-change="handleChange3">
				<div :style="{float: 'right', margin: '2px'}">
					<Button size="small" @click="reloadMockData">刷新数据源</Button>
				</div>
			</Transfer>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="settingCode = false" ref='cancel'>取消操作</Button>
				<Button type="primary" @click="drawerSubmit">确认授权</Button>
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
	import Cookies from 'js-cookie';
	import notices from '../../notice.js'
	export default {
		data() {
			return {
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
				//穿梭框
				data3: this.getMockData(),
				targetKeys3: this.getTargetKeys(),
				targetKey: [],
				//存储源数据
				mockDataOrg: [],
				listStyle: {
					width: '265px',
					height: '100%'
				},
				//抽屉
				settingCode: false,
				formData: {

				},
				styles: {
					height: 'calc(100% - 55px)',
					overflow: 'auto',
					paddingBottom: '53px',
					position: 'static'
				},
				//Card数据展示页
				formItem: {
					input: '',
					ISPARENT: 'noParent',
					ISLOCKED: 'noEnble',
					CODE: ''
				},
				//Tree数据
				TreeData: [],
				buttonProps: {
					type: 'default',
					size: 'small',
				},
				thisNode: {
					root: {},
					node: {},
					data: {}
				}
			}
		},
		methods: {
			goIview() {
				window.open('https://www.iviewui.com/components/icon')
			},
			//穿梭框方法
			getDrawer() {
				this.settingCode = true
				this.reloadMockData()
			},
			getMockData() {
				let mockData = [];
				if (this.formItem != undefined) {
					let params = {
						"CODE": this.formItem.CODE
					}
					this.$http.exFunction(this,
						"sysMenu",
						"getDrawerData",
						1, params, 0, res => {
							var CmockData = res.data.mockData;
							for (var i = 0; i < CmockData.length; i++) {
								mockData.push({
									key: CmockData[i].key,
									label: CmockData[i].label,
									description: CmockData[i].description,
									disabled: CmockData[i].disabled,
									name: CmockData[i].name,
								});
							}
							this.targetKeys3 = res.data.targetKeys;
						})
				} else {
					mockData = []
				}
				return mockData;
			},
			getTargetKeys() {
				return this.targetKey3;
			},
			handleChange3(newTargetKeys) {
				this.targetKeys3 = newTargetKeys;
			},
			render3(item) {
				return item.label + ' - ' + item.description;
			},
			reloadMockData() {
				this.data3 = this.getMockData();
				this.targetKeys3 = this.getTargetKeys();
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
					this.formItem.ISLOCKED = 'noEnble'
					this.formItem.ISPARENT = 'noParent'
					this.formItem.PID = data.id;
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
					notices.notice(_this, '操作提示', '菜单:' + title + '删除成功', 1)
				} else {
					var param = {
						"ID": this.thisNode.data.id,
						"VERSION": this.thisNode.data.version + 1
					}
					this.$http.exFunction(this,
						"sysMenu",
						"removeMenuNode",
						3, param, 0, res => {
							if (res.data.search("成功") != -1) {
								notices.notice(_this, '操作提示', '菜单:' + title + '删除成功', 1)
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
				var mock = this.data3;
				var keys = this.targetKeys3;
				var re = '';
				for (var i = 0; i < mock.length; i++) {
					for (var j = 0; j < keys.length; j++) {
						if (mock[i].key == keys[j]) {
							re += "," + mock[i].label
						}
					}
				}
				this.formItem.CODE = re.substring(1, re.length);
				//模拟点击关闭抽屉
				this.$refs.cancel.$el.click();
			},
			//获取Tree数据
			getTreeData() {
				var _this = this;
				let params = {}
				this.$http.exFunction(this,
					"sysMenu",
					"getMenuTree",
					1, params, 0, res => {
						_this.TreeData = eval(res.data);
					})
			},
			//编辑数据填充
			editCreateNode(data, isDisable) {
				var _this = this;
				if (data.id == 0) {
					this.$Message.warning('root节点无法编辑', 3);
				} else {
					this.formDisable = isDisable;
					this.$http.selectById(this,
						"SYSMENU",
						"",
						"",
						data.id,
						0, res => {
							//赋值
							this.formItem = res.data;
							this.formItem.ISLOCKED = this.formItem.ISLOCKED == 1 ? 'isEnble' : 'noEnble'
							this.formItem.ISPARENT = this.formItem.ISPARENT == 0 ? 'isParent' : 'noParent'
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
						"TITLE": this.formItem.TITLE,
						"CONTENT": this.formItem.CONTENT,
						"ISLOCKED": this.formItem.ISLOCKED == 'isEnble' ? 1 : 0,
						"ISPARENT": this.formItem.ISPARENT == 'noParent' ? 1 : 0,
						"SORT": this.formItem.SORT,
						"NAME": this.formItem.NAME,
						"PATH": this.formItem.PATH,
						"COMPONENT": this.formItem.COMPONENT,
						"PID": this.formItem.PID == 0 ? -1 : this.formItem.PID,
						"ICON": this.formItem.ICON,
						"CODE": this.formItem.CODE,
					}
					//新增
					this.$http.exFunction(this,
						"sysMenu",
						"insertMenuNode",
						2, param, 0, res => {
							if (res.data != '') {
								notices.notice(_this, '操作提示', '菜单:' + this.formItem.TITLE + '新增成功', 1)
								//修改Tree节点信息
								this.$set(this.isNewData, 'title', this.formItem.TITLE);
								this.$set(this.isNewData, 'id', res.data);
								this.$set(this.isNewData, 'version', 1);
								//锁定编辑区域
								this.formDisable = true;
								//更新isNew状态
								this.isNew = false;
							} else {
								notices.notice(_this, '操作提示', res.data == '' ? '意料之外的错误,请联系管理员' : '菜单:' + this.formItem.TITLE + '新增失败', 3)
							}
						})
				} else {
					var param = {
						"SYSMENU_TITLE": this.formItem.TITLE,
						"SYSMENU_CONTENT": this.formItem.CONTENT,
						"SYSMENU_ISLOCKED": this.formItem.ISLOCKED == 'isEnble' ? 1 : 0,
						"SYSMENU_ISPARENT": this.formItem.ISPARENT == 'noParent' ? 1 : 0,
						"SYSMENU_SORT": this.formItem.SORT,
						"SYSMENU_NAME": this.formItem.NAME,
						"SYSMENU_PATH": this.formItem.PATH,
						"SYSMENU_COMPONENT": this.formItem.COMPONENT,
						"SYSMENU_PID": this.formItem.PID,
						"SYSMENU_CODE": this.formItem.CODE,
						"SYSMENU_ICON": this.formItem.ICON,
						"ID": this.formItem.ID,
						"VERSION": this.formItem.VERSION + 1
					}
					//编辑
					this.$http.exFunction(this,
						"sysMenu",
						"updateMenuNode",
						3, param, 0, res => {
							if (res.data.search("成功") != -1) {
								notices.notice(_this, '操作提示', "菜单信息更新成功", 1)
								//修改Tree节点信息
								this.$set(this.isNewData, 'title', this.formItem.TITLE);
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
