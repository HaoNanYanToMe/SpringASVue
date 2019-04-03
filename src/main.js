import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import util from './libs/util';
import axios from 'axios';
import $ from 'jquery';
import Carousel3d from 'vue-carousel-3d';
import VueQuill from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import Vuex from 'vuex'
import http from './http.js'
import ECharts from 'vue-echarts/components/ECharts'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

Vue.prototype.$http = http

Vue.use(Vuex);
Vue.use(Carousel3d);
Vue.use(VueI18n);
Vue.use(iView);
Vue.component('chart', ECharts)

new Vue({
	el: '#app',
	router: router,
	store: store,
	render: h => h(App),
	data: {
		currentPageName: '',
	},
	mounted () {
		this.currentPageName = this.$route.name;
		// 显示打开的页面的列表
		this.$store.commit('setOpenedList');
		this.$store.commit('initCachepage');
		// 保存用户的token和code全局字段
		this.$store.commit('userToken');
		this.$store.commit('userCode');
		this.$store.commit('shrinked');
	},
	created () {
		let tagsList = [];
		appRouter.map((item) => {
			if (item.children.length <= 1) {
				tagsList.push(item.children[0]);
			} else {
				tagsList.push(...item.children);
			}
		});
		this.$store.commit('setTagsList', tagsList);
	}
});
