<style lang="less">
	@import "./main.less";
</style>
<style>
	.sidebar-menu-con::-webkit-scrollbar{
		display:none;
	}
</style>
<template>
	<div class="main" :class="{'main-hide-text': shrink}">
		<div class="sidebar-menu-con" :style="{width: shrink?'60px':'200px', overflow: shrink ? 'visible' : 'auto'}">
			<shrinkable-menu
				:shrink="shrink"
				@on-change="handleSubmenuChange"
				:theme="menuTheme"
				:before-push="beforePush"
				:open-names="openedSubmenuArr"
				:menu-list="menuList">
				<div slot="top" class="logo-con">
					<Button v-show="!shrink" type="primary" style="font-size:24px;padding:0 8px;">New Oriental</Button>
					<Button v-show="shrink" type="primary" style="font-size:24px;padding:0 8px;">N</Button>
				</div>
			</shrinkable-menu>
		</div>
    <div class="main-header-con" :style="{paddingLeft: shrink?'60px':'200px'}">
		<!-- <div class="main-header-con"> -->
			<div class="main-header">
				<div class="navicon-con">
					<Button :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" type="text" @click="toggleClick">
						<Icon type="ios-menu-outline" size="32" style='border: none;'></Icon>
					</Button>
				</div>
				<div class="header-middle-con">
					<div class="main-breadcrumb">
						<breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
					</div>
				</div>
				<div class="header-avator-con">
					<message-tip v-model="mesCount"></message-tip>
					<full-screen v-model="isFullScreen" @click.native="fullscreenChange"></full-screen>
					<lock-screen></lock-screen>
					
					<div class="user-dropdown-menu-con">
						<Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
							<Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
								<a href="javascript:void(0)">
									<span class="main-user-name">{{ userName }}</span>
									<Icon type="md-arrow-dropdown" />
								</a>
								<DropdownMenu slot="list">
									<DropdownItem name="ownSpace">个人中心</DropdownItem>
									<DropdownItem name="loginout" divided>退出登录</DropdownItem>
								</DropdownMenu>
							</Dropdown>
							<Avatar style="background: #619fe7;margin-left: 5px;">{{ userName.substring(0,1) }}</Avatar>
						</Row>
					</div>
				</div>
			</div>
			<div class="tags-con">
				<tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
			</div>
		</div>
    <div class="single-page-con" :style="{left: shrink?'60px':'200px'}">
		<!-- <div class="single-page-con"> -->
			<div class="single-page">
				<keep-alive :include="cachePage">
					<router-view></router-view>
				</keep-alive>
			</div>
		</div>
	</div>
</template>
<script>
	import shrinkableMenu from './main-components/shrinkable-menu/shrinkable-menu.vue';
	import tagsPageOpened from './main-components/tags-page-opened.vue';
	import breadcrumbNav from './main-components/breadcrumb-nav.vue';
	import fullScreen from './main-components/fullscreen.vue';
	import lockScreen from './main-components/lockscreen/lockscreen.vue';
	import messageTip from './main-components/message-tip.vue';
	import Cookies from 'js-cookie';
	import util from '@/libs/util.js';
	import {appRouter} from '../router/router';
  var qs = require('qs');

	export default {
		components: {
			shrinkableMenu,
			tagsPageOpened,
			breadcrumbNav,
			fullScreen,
			lockScreen,
			messageTip,
		},
		data () {
			return {
				shrink: false,
				userName: '',
				isFullScreen: false,
				openedSubmenuArr: this.$store.state.app.openedSubmenuArr
			};
		},
		computed: {
			menuList () {
				return this.$store.state.app.menuList;
			},
			pageTagsList () {
				return this.$store.state.app.pageOpenedList; // 打开的页面的页面对象
			},
			currentPath () {
				return this.$store.state.app.currentPath; // 当前面包屑数组
			},
			avatorPath () {
				return localStorage.avatorImgPath;
			},
			cachePage () {
				return this.$store.state.app.cachePage;
			},
			lang () {
				return this.$store.state.app.lang;
			},
			menuTheme () {
				return this.$store.state.app.menuTheme;
			},
			mesCount () {
				return this.$store.state.app.messageCount;
			},
      approCount () {
				return this.$store.state.app.approvalCount;
			}
		},
		methods: {
			init () {
				let pathArr = util.setCurrentPath(this, this.$route.name);
				this.$store.commit('updateMenulist');
				if (pathArr.length >= 2) {
					this.$store.commit('addOpenSubmenu', pathArr[1].name);
				}
				this.userName = Cookies.get('user');
				this.checkTag(this.$route.name);
			},
			toggleClick () {
				this.shrink = !this.shrink;
				this.$store.commit('shrinked',this.shrink);
			},
			handleClickUserDropdown (name) {
				if (name === 'ownSpace') {
					util.openNewPage(this, 'ownspace_index');
					this.$router.push({
						name: 'ownspace_index'
					});
				} else if (name === 'loginout') {
					// 退出登录
					this.$store.commit('logout', this);
					this.$store.commit('clearOpenedSubmenu');
					window.location.href = 'http://bj.xdf.cn/ch/logout'
				}
			},
			checkTag (name) {
				let openpageHasTag = this.pageTagsList.some(item => {
					if (item.name === name) {
						return true;
					}
				});
				if (!openpageHasTag) { //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
					util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {});
				}
			},
			handleSubmenuChange (val) {
			},
			beforePush (name) {
				return true;
			},
			fullscreenChange (isFullScreen) {
				// console.log(isFullScreen);
			}
		},
		watch: {
			'$route' (to) {
				this.$store.commit('setCurrentPageName', to.name);
				let pathArr = util.setCurrentPath(this, to.name);
				if (pathArr.length > 2) {
					this.$store.commit('addOpenSubmenu', pathArr[1].name);
				}
				this.checkTag(to.name);
				localStorage.currentPageName = to.name;
			},
			lang () {
				util.setCurrentPath(this, this.$route.name); // 在切换语言时用于刷新面包屑
			}
		},
		mounted () {
			this.init();
		},
		created () {
			// 显示打开的页面的列表
			this.$store.commit('setOpenedList');
		}
	};
</script>
