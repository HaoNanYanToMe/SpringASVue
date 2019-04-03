export default {
	//提醒
	//type 0-info 1-success 2-warning 3-error
	notice(that, title, desc, type) {
		if (type == 0) {
			that.$Notice.info({
				title: title,
				desc: desc,
				duration: 5,
				render: h => {
					return h('span', desc)
				}
			});
		}else if(type == 1){
			that.$Notice.success({
				title: title,
				desc: desc,
				duration: 5,
				render: h => {
					return h('span', desc)
				}
			});
		}else if(type == 2){
			that.$Notice.warning({
				title: title,
				desc: desc,
				duration: 5,
				render: h => {
					return h('span', desc)
				}
			});
		}else if(type == 3){
			that.$Notice.error({
				title: title,
				desc: desc,
				duration: 5,
				render: h => {
					return h('span', desc)
				}
			});
		}
	}
}
