<style lang="less">
	@import './loginNormal.less';
</style>

<template>
	<div class="login">
		<div class="login-con">
			<Card class="cards" icon="log-in" title="欢迎使用" :bordered="false">
				<div class="form-con">
					<Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
						<FormItem prop="userName">
							<Input v-model="form.userName" placeholder="请输入用户名">
							<span slot="prepend">
								<Icon :size="16" type="ios-person"></Icon>
							</span>
							</Input>
						</FormItem>
						<FormItem prop="password">
							<Input type="password" v-model="form.password" placeholder="请输入密码">
							<span slot="prepend">
								<Icon :size="14" type="md-lock"></Icon>
							</span>
							</Input>
						</FormItem>
						<FormItem>
							<Button @click="handleSubmit" type="primary" long>登录</Button>
						</FormItem>
					</Form>
					<p class="login-tip"></p>
				</div>
			</Card>
		</div>
	</div>
</template>

<script>
	var qs = require('qs');
	import md5 from 'js-md5';
	import store from '../store';
	import Cookies from 'js-cookie';
	import notices from '../notice.js'

	export default {
		data() {
			return {
				form: {
					userName: 'yanhaonan@xdf.cn',
					password: '123456'
				}
			}
		},
		props: {
			userNameRules: {
				type: Array,
				default: () => {
					return [{
						required: true,
						message: '账号不能为空',
						trigger: 'blur'
					}]
				}
			},
			passwordRules: {
				type: Array,
				default: () => {
					return [{
						required: true,
						message: '密码不能为空',
						trigger: 'blur'
					}]
				}
			}
		},
		computed: {
			rules() {
				return {
					userName: this.userNameRules,
					password: this.passwordRules
				}
			}
		},
		methods: {
			goRouter(uid) {
				var _this = this;
				let params = {
					"uid": uid
				}

				this.$http.exFunction(this,
					"sysUser",
					"getRouter",
					1, params, 1, res => {
						Cookies.set('user', '超级管理员');
						localStorage.setItem('rout', JSON.stringify(res.data));
						_this.$store.commit('updateMenulist');
						_this.$router.push({
							name: 'home_index'
						});
					})
			},
			handleSubmit() {
				var _this = this;
				this.$http.loginAdmin(_this,
					_this.form.userName,
					md5(_this.form.password),
					1, res => {
						if (res.data.result != 1) {
							notices.notice(_this, '操作提示', res.data.resultData, 3)
						} else {
							_this.goRouter(res.data.uid)
						}
					})
			}
		}
	}
</script>
