import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
	path: '/login',
	name: 'login',
	meta: {
		title: 'Spring A.S·业务管理后台'
	},
	component: () =>
		import ('@//views/login.vue')
};

export const page404 = {
	path: '/*',
	name: 'error-404',
	meta: {
		title: '404-页面不存在'
	},
	component: () =>
		import ('@/views/error-page/404.vue')
};

export const page403 = {
	path: '/403',
	meta: {
		title: '403-权限不足'
	},
	name: 'error-403',
	component: () =>
		import ('@//views/error-page/403.vue')
};

export const login403 = {
	path: '/login403',
	meta: {
		title: '403-权限不足'
	},
	name: 'login-403',
	component: () =>
		import ('@//views/error-page/login403.vue')
};

export const page500 = {
	path: '/500',
	meta: {
		title: '500-服务端错误'
	},
	name: 'error-500',
	component: () =>
		import ('@/views/error-page/500.vue')
};

export const preview = {
	path: '/preview',
	name: 'preview',
	component: () =>
		import ('@/views/form/article-publish/preview.vue')
};

export const locking = {
	path: '/locking',
	name: 'locking',
	component: () =>
		import ('@/views/main-components/lockscreen/components/locking-page.vue')
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
	path: '/',
	name: 'otherRouter',
	redirect: '/home',
	component: Main,
	meta: {
		title: 'Spring A.S·业务后台管理系统'
	},
	children: [{
		path: 'home',
		title: {
			i18n: 'home'
		},
		name: 'home_index',
		component: () =>
			// import ('@/views/home/home.vue')
			import ('@/views/bars/bars.vue')
	}]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
	{
		path: '/roles',
		title: '系统权限管理',
		icon: 'ios-pricetags',
		name: 'BaseTools',
		component: Main,
		children: [{
			path: 'menuPage',
			title: '菜单管理',
			name: 'menu_index',
			component: () =>
				import ("@/views/roles/menuIndex.vue")
		},
		{
			path: 'rolePage',
			title: '权限管理',
			name: 'role_index',
			component: () =>
				import ('@/views/roles/roleIndex.vue')
		},
		{
			path: 'dataSourcePage',
			title: '数据源管理',
			name: 'dataSource_index',
			component: () =>
				import ('@/views/roles/dataSourceIndex.vue')
		},
		{
			path: 'userPage',
			title: '系统用户管理',
			name: 'user_index',
			component: () =>
				import ('@/views/roles/userIndex.vue')
		}],
	},
	{
		path: '/hetara',
		title: 'HeTaRa数据优化引擎',
		icon: 'ios-pricetags',
		name: 'hetaraBase',
		component: Main,
		children: [{
			path: 'hetaraPage',
			title: '规则引擎设置',
			name: 'hetara_index',
			component: () =>
				import ("@/views/hetara/hetaraIndex.vue")
		},{
			path: 'hetaraTypePage',
			title: '引擎分类管理',
			name: 'type_index',
			component: () =>
				import ("@/views/hetara/typeIndex.vue")
		}
		],
	}
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
	loginRouter,
	otherRouter,
	preview,
	locking,
	...appRouter,
	page500,
	page403,
	login403,
	page404
];
