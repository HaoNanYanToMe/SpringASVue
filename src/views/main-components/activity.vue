<template>
  <div @click="gos" class="message-con">
    <Tooltip content="活动中心" placement="bottom">
        <!-- <Icon type="ios-football"></Icon> -->
        <Icon type="ios-body" :size="22"></Icon>
    </Tooltip>
  </div>
</template>

<script>
import util from '@/libs/util.js';
export default {
    name: 'todayFood',
    data(){
      return {}
    },
    methods: {
        gos () {
            util.openNewPage(this, 'activityDetail_index');
            this.$router.push({
                name: 'activityDetail_index'
            });
        }
    }
};
</script>
