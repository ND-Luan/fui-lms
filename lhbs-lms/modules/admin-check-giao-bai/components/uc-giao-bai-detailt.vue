<template>
	<v-dialog v-model="isOpen">
		<v-card>
			<v-card-title class="text-primary d-flex">Chi tiết bài giao - GV: {{itemDetail.HoTen}} - Khối
				{{itemDetail.KhoiID}} - Môn {{itemDetail.TenMonHoc_HienThi}}
				<v-spacer></v-spacer>
				<v-btn icon @click="onClose()">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-card-title>
			<v-card-text class="d-flex flex-column ga-2">
				<div class="d-flex ga-2">
					<v-chip color="primary" size="small">{{ itemDetail.SoLuongBaiTap }} bài
						tập</v-chip>
					<v-chip color="success" size="small">{{ itemDetail.SoLuongBaiHoc }} bài
						học</v-chip>
				</div>
				<v-data-table :items="DataTable" :headers="headers" class="custom-table">
					<template #item.ResourceType="{ item }">
						<v-chip :color="item.ResourceType == 'Bài tập' ? 'primary' : 'success'"
							size="small">{{item.ResourceType}}</v-chip>
					</template>
					<template #item.CreateTime="{ item }">
						<span>{{formatDate(item.CreateTime)}}</span>
					</template>
					<template #item.ClassAssigned="{ item }">
						<div v-if="item.ClassAssigned.length > 0" class="d-flex flex-wrap ga-2">
							<v-chip v-for="classItem in item.ClassAssigned" color="orange" size="small" @click="getClassDetail(classItem,item)">
								{{classItem.TenLop}}
							</v-chip>
						</div>
						<v-chip v-else color="error" size="small">
							Chưa giao lớp nào
						</v-chip>
					</template>
				</v-data-table>
                <uc-class-detail v-if="isShowModalClassDetail" v-model:isOpen="isShowModalClassDetail" :assignmentInfo :classDetail :assignedDetail :key="keyComp" :itemDetail/>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>
<script>
	export default {
	    props: {
	        isOpen: Boolean,
	        itemDetail: Object
	    },
	    emits: ['update:isOpen'],
	    data() {
	        return {
                keyComp:0,
	            DSBaiTap: [],
	            DSBaiHoc: [],
	            DSLopDuocGiao: [],
	            DataTable: [],
                isShowModalClassDetail:false,
				assignmentInfo:{},
	            headers: [
	                {
	                    title: 'Resource ID',
	                    value: 'ResourceID'
	                },
	                {
	                    title: 'Resource Type',
	                    value: 'ResourceType'
	                },
	                {
	                    title: 'Tiêu đề',
	                    value: 'Title'
	                },
	                {
	                    title: 'Tuần',
	                    value: 'Tuan_HienThi'
	                },
	                {
	                    title: 'Thời gian tạo',
	                    value: 'CreateTime'
	                },
	                {
	                    title: 'Các lớp đã giao',
	                    value: 'ClassAssigned'
	                },
	            ],
	            _,
                classDetail:{}
	        }
	    },
        computed:{
            assignedDetail:function(){
                return this.itemDetail
            },
            
        },
	    mounted() {
	        console.log('itemDetail', this.itemDetail)
	        this.getDataDetail()
	    },
	    methods: {
	        onClose() {
	            this.$emit('update:isOpen', false)
	        },
	        getDataDetail() {
	            let payload = {
	                GiaoVienID: this.itemDetail.GiaoVienID,
	                KhoiID: this.itemDetail.KhoiID,
					MonHocID :this.itemDetail.MonHocID
	            }
	            ajaxCALL('lms/TienDo_GiaoBai_DetailByGiaoVienID', payload, res => {
	                if (res.data.length > 0) {
	                    let DSBaiTap = res.data[0]
	                    let DSBaiHoc = res.data[1]
	                    let DSLopDuocGiao = res.data[2]
	                    let DataTable = _.concat(DSBaiTap, DSBaiHoc).map(item => {
	                        let mapItem = {
	                            ResourceID: item.AssignmentID ?? item.LessonID,
	                            ResourceType: item.AssignmentID ? 'Bài tập' : 'Bài học',
	                            Title: item.Title,
	                            Tuan_HienThi: item.Tuan_HienThi ?? '',
	                            CreateTime: item.CreateTime,
	                            ClassAssigned: DSLopDuocGiao.filter((classItem) => classItem.ResourceID == (item.AssignmentID ?? item.LessonID)),
								MaxScore: item.MaxScore ?? null
	                        }
	                        return mapItem
	                    })
	                    this.DataTable = DataTable
	                    console.log('DataTable',  this.DataTable)
	
	
	                }
	            },
	            )
	        },
	        getClassDetail(item,assignmentInfo) {
                this.isShowModalClassDetail = true
	           this.classDetail = item
			   this.assignmentInfo=assignmentInfo
               this.keyComp ++
	        },
	        formatDate(date) {
	            return dayjs(date).format('HH:mm DD/MM/YYYY')
	        },
	        dayjs
	    },
	    watch: {
	
	    }
	}
</script>