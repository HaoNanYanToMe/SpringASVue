<template>
	<div id="main" class="app-main">
		<router-view></router-view>
	</div>
</template>

<script>
export default {
	data () {
		return {
			theme: this.$store.state.app.themeColor
		};
	},
	mounted () {
	},
	beforeDestroy () {

	},
	methods: {

	}
};
</script>

<style>
html,body{
	width: 100%;
	height: 100%;
	background: #f0f0f0;
	overflow: hidden;
}
.app-main{
	width: 100%;
	height: 100%;
}
/*标签*/
.tags{
	border-bottom: 2px solid #ccc;
	font-size: 16px;
	text-align: center;
	position:relative;
	margin: 16px 0 0 40px;
	padding:0 16px 2px;
}
.tags::before{
	content:'';
	width:40px;
	position:absolute;
	border-top:4px solid #2d8cf0;
	left:-40px;bottom:-2px;
	border-radius:2px 2px 0 0 ;
}
.ivu-btn{
	padding:5px 20px;
}
.single-page {
	height:calc(100% - 20px)
}
.app-height {
	height:100%;
}
.app-min-height{
	min-height:100%;
}
.contents{
	overflow:hidden;overflow-y:auto;
}
.contents::-webkit-scrollbar
{
	width: 6px;
	height: 6px;
	background-color: #F5F5F5;
}
.contents::-webkit-scrollbar{
	  display:none;
}
/*定义滚动条轨道 内阴影+圆角*/
.contents::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	border-radius: 10px;
	background-color: #F5F5F5;
}

/*定义滑块 内阴影+圆角*/
.contents::-webkit-scrollbar-thumb
{
	border-radius: 10px;
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
	background-color: #2d8cf0;
}
/*弹出框title样式修改*/
.ivu-modal-header-inner{
	font-size: 20px;
	font-weight: normal;
}
/* 提示点击客户头像 */
.customerTips{
	position:absolute;
	top:100px;left:30px;
	animation: clicks 3s infinite;
}
.customerTips img{
	width:330px;
}
.BGcovers{
	background: rgba(255,255,255,0.9);
	position: absolute;
	width: 100%;
	left: 0;
	z-index: 999;
	top: 0;

}
@keyframes clicks {
	0% {
		left:30px
	}
	10% {
		left:10px
	}
	20% {
		left:30px
	}
	30% {
		left:10px
	}
	40% {
		left:30px
	}
	100% {
		left:30px
	}
}

</style>
