<template>
    <div @click="showApproval" class="message-con">
      <!-- <Tooltip :content="value > 0 ? '有' + value + '条未审批信息' : '无未未审批信息'" placement="bottom"> -->
        <Tooltip :content="value > 0 ? '有未审批信息' : '无未审批信息'" placement="bottom">
            <Badge :count="value" dot>
                <Icon type="document-text" :size="22"></Icon>
            </Badge>
        </Tooltip>
    </div>
</template>

<script>
import util from '@/libs/util.js';
export default {
    name: 'approvalTip',
    props: {
        value: {
            type: Number,
            default: 0
        }
    },
    methods: {
        showApproval () {
            util.openNewPage(this, 'approval_index');
            this.$router.push({
                name: 'approval_index'
            });
        }
    }
};
</script>
