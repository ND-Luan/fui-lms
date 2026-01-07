<template>
	<v-card>
		<v-card-title class="text-primary">
			Bảng tỉ lệ điểm kĩ năng nói theo khối
		</v-card-title>
		<v-card-text>
			<v-table>
				<thead>
					<tr>
						<th v-for="header in headers" :key="header.key" :colspan="header.colspan"
							:rowspan="header.rowspan" class="text-center">{{ header.title }}
						</th>

					</tr>
					<tr>
						<th v-for="item in subHeader" class="text-center">{{ item.title }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(khoi, index) in dataSkills" :key="index">

						<td v-for="col in columnsTable" :key="col.key"
							:class="{ 'text-end': !['TenNhom', 'TongHocSinh_GK'].includes(col.key), 'text-center': ['TenNhom', 'TongHocSinh_GK'].includes(col.key) }">
							{{ khoi[col.key]
							?? '-' }} <span v-if="!['TenNhom', 'TongHocSinh_GK'].includes(col.key)">%</span></td>
					</tr>
				</tbody>
			</v-table>
		</v-card-text>
	</v-card>
	<v-card :flat="false">
		<v-card-title class="text-primary d-flex align-center">
			Tương quan điểm giữa kì và cuối kì
			<v-spacer></v-spacer>
		</v-card-title>
		<v-card-text>
			<uc-chart-apex :options="Chart_TiLe_TheoLop" />
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
    props: {},
    data() {
        return {
            vueData,
            headers: [
                {
				title: "Lớp",
				key: "LopID",
                    colspan: 1,
                    rowspan: 2
                },
                {
                    title: "Tổng học sinh",
                    key: "TongHocSinh",
                    colspan: 1,
                    rowspan: 2
                },
                {
                    title: "Giữa kì",
                    key: "GK",
                    colspan: 3,
                    rowspan: 1
                },
                {
                    title: "Cuối kì",
                    key: "CK",
                    colspan: 3,
                    rowspan: 1
                },

            ],
            subHeader: [
                { title: "Chưa đạt", key: "Noi_CD_PCT_GK" },
                { title: "Đạt", key: "Noi_D_PCT_GK" },
                { title: "Vượt đạt", key: "Noi_VYC_PCT_GK" },
                { title: "Chưa đạt", key: "Noi_CD_PCT_CK" },
                { title: "Đạt", key: "Noi_D_PCT_CK" },
                { title: "Vượt đạt", key: "Noi_VYC_PCT_CK" },
            ],
            dataSkills: [],
            Chart_TiLe_TheoLop: {
                "id": "chart-compare-giua-ky-cuoi-ki",
                "series": [],
                "chart": {
                    "type": "bar",
                    "height": 350,
                    "stacked": true,
                    "toolbar": {
                        "show": true
                    },
                    "zoom": {
                        "enabled": false
                    }
                },
                "xaxis": {
                    "categories": []
                },
                yaxis: {
                    max: 100,  // Giá trị tối đa của trục Y
                    labels: {
                        formatter: val => val + "%"
                    }
                },
                "plotOptions": {
                    "bar": {
                        "horizontal": false,
                        "borderRadius": 10,
                        "borderRadiusApplication": "end",
                        "borderRadiusWhenStacked": "last",

                    }
                },
                "dataLabels": {
                    enabled: true,
                    "style": {
                        "fontSize": "13px",
                        "fontWeight": 900
                    },
                    formatter: val => val + "%"
                },
                "legend": {
                    "position": "right",
                    "offsetY": 40
                },
                "fill": {
                    "opacity": 1
                }
            },
        }
    },
    async mounted() {
        await this.handleData(['TenNhom', 'TongHocSinh', 'Noi'])
        await this.handleDataChart()
    },
    computed: {
        columnsTable() {

            return [
                {
                    title: "Lớp",
                    key: "TenNhom"
                },
                {
                    title: "Tổng học sinh",
                    key: "TongHocSinh_GK"
                },
                ...this.subHeader
            ]
        }
    },
    methods: {
        async handleData(keysGet) {
            let data = []
            vueData.Dashboard_KyNang_TA2_GK.forEach(khoi => {
                //Phân rã key trong Objet
                let keyObject = Object.keys(khoi)
                let objData = {
TenNhom: khoi.TenNhom
                }
                //Lặp qua các key nếu key nào có chứa chuỗi trong keysGet thì lấy key đó rồi map giá trị
                keyObject.forEach(k => {
                    if (keysGet.some(item => k.includes(item))) {
                        objData[k + '_GK'] = khoi[k]
                    }
                })
               
                data.push(objData);
            });
            data.forEach(khoi => {
            let khoiCK = vueData.Dashboard_KyNang_TA2_CK.find(x => x.TenNhom === khoi.TenNhom)
            if (khoiCK) {
            //Phân rã key trong Objet
            let keyObject = Object.keys(khoiCK)
            //Lặp qua các key nếu key nào có chứa chuỗi trong keysGet thì lấy key đó rồi map giá trị
            keyObject.forEach(k => {
            if (keysGet.some(item => k.includes(item) && !['KhoiID', 'TongHocSinh'].includes(k))) {
            khoi[k + '_CK'] = khoiCK[k]
            }
            })
            }
            })
            this.dataSkills = data;
            console.log(data);
        },
        async handleDataChart() {
            const categoriesChartTiLe_TheoLops = [...new Set(this.dataSkills.map(x => ('Lớp ' + x.TenNhom)))]
            const serieChartTiLe_TheoLops = [
                {
                    name: 'Vượt yêu cầu - Giữa kì',
                    group: 'S1_Mid_Total_Conv',
                    data: this.dataSkills.map(data => data.Noi_VYC_PCT_GK)
                },
                {
                    name: 'Vượt yêu cầu - Cuối kì',
                    group: 'S1_Final_Total_Conv',
                    data: this.dataSkills.map(data => data.Noi_VYC_PCT_CK)
                },
                {
                    name: 'Đạt yêu cầu - Giữa kì',
                    group: 'S1_Mid_Total_Conv',
                    data: this.dataSkills.map(data => data.Noi_D_PCT_GK)
                },
                {
                    name: 'Đạt yêu cầu - Cuối kì',
                    group: 'S1_Final_Total_Conv',
                    data: this.dataSkills.map(data => data.Noi_D_PCT_CK)
                },
                {
                    name: 'Chưa đạt - Giữa kì',
                    group: 'S1_Mid_Total_Conv',
                    data: this.dataSkills.map(data => data.Noi_CD_PCT_GK)
                },
                {
                    name: 'Chưa đạt - Cuối kì',
                    group: 'S1_Final_Total_Conv',
                    data: this.dataSkills.map(data => data.Noi_CD_PCT_CK)
                }
            ]
            this.Chart_TiLe_TheoLop = {
                ...this.Chart_TiLe_TheoLop,
                series: serieChartTiLe_TheoLops,
                colors: ['#008FFB', '#008FFB', '#80c7fd', '#80c7fd', '#fdb72f', '#fdb72f'],
                xaxis: {
                    categories: categoriesChartTiLe_TheoLops
                },
                plotOptions: {
                    bar: {
                        horizontal: false
                    }
                }, legend: {
                    customLegendItems: [
						'Not Meeting Requirements/Chưa đạt',
                        'Exceeding Requirements/Vượt yêu cầu',
                        'Meeting Requirements/Đạt yêu cầu',
                       
                    ],
                    markers: { fillColors: ['#fdb72f','#008FFB', '#80c7fd'] },
                    position: 'top',
                    floating: false,
                    itemMargin: {
                        horizontal: 10
                    }
                }
            }
        }

    }
}
</script>