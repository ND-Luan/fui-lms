<template>
    <uc-app :isAdmin="false">
        <template v-slot:title>
            <p class="text-center text-h6 text-primary">Class Report</p>
            <p class="text-center font-italic">Tháng 10</p>
            <v-row>
                <v-col cols="6" class="text-center">
                    <div class="d-flex justify-center algin-center ga-4">
                        <p class="text-subtitle-1">Student Name:</p>
                        <p class="text-subtitle-2">Nguyễn Văn A</p>
                    </div>
                    <v-divider class="mx-auto w-50 bg-white" style="height: 4px;"></v-divider>
                </v-col>
                <v-col cols="6" class="text-center">
                    <p>Level & Section: <span class="font-weight-medium">xxxxxxx</span></p>
                </v-col>
                <v-col cols="6" class="text-center">
                    <p>School Year: <span class="font-weight-medium">xxxxxxx</span></p>
                </v-col>
                <v-col cols="6" class="text-center">
                    <p>Teacher Name: <span class="font-weight-medium">xxxxxxx</span></p>
                </v-col>
            </v-row>
        </template>
        <template v-slot:detail>

            <v-row>
                <v-col>Điểm</v-col>
            </v-row>
            <v-row>
                <v-col xs="12" sm="12" md="6" lg="6">
                    <p>Nhận xét</p>
                    <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nesciunt quos magni ipsum error nostrum
                        ea
                        exercitationem facere ducimus deleniti, ipsa facilis, officiis, fuga soluta fugiat? Consequuntur
                        sequi atque explicabo sint!</p>
                </v-col>
            </v-row>
        </template>

    </uc-app>
</template>

<script>
export default {}
</script>