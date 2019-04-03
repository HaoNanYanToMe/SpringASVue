<template>
    <div @click="gos" class="message-con">
        <Tooltip content="数据图表" placement="bottom">
            <Icon type="connection-bars" :size="22"></Icon>
        </Tooltip>
    </div>
</template>

<script>
import util from '@/libs/util.js';
export default {
    name: 'barsTip',
    methods: {
        gos () {
            util.openNewPage(this, 'bars_index');
            this.$router.push({
                name: 'bars_index'
            });
        }
    }
};
</script>
