<style lang="less">
    @import './403.less';
</style>

<template>
    <div class="error403">
        <div class="error403-body-con">
            <Card>
                <div class="error403-body-con-title">4<span class="error403-0-span"><Icon type="ios-timer"></Icon></span><span class="error403-key-span"><Icon size="220" type="md-flash"></Icon></span></div>
                <p class="error403-body-con-message">您的登录状态已失效</p>
								<p class="error403-body-con-message2">1.您已使用系统超过四个小时</p>
								<p class="error403-body-con-message2">2.您已在其他地点登录本系统</p>
                <div class="error403-btn-con">
                    <Button @click="backPage" size="large" style="width: 200px;margin-left: 40px;" type="primary">返回重新登录</Button>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie';

export default {
    name: 'Login403',
    methods: {
        backPage () {
           window.location.href = 'http://bj.xdf.cn/ch/logout'
        }
    }
};
</script>
