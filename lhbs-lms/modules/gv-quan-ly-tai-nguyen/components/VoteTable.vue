<template>
	<div>
    <template v-if="!isEdit">
      <div class="font-weight-bold pb-2">{{ data.Text }} <span v-if="data.Required" class="error--text">*</span></div>
      <div v-if="data.Des" class="pb-2" v-html="data.Des"></div>
      
      <!-- Desktop View -->
      <v-simple-table class="d-none d-md-block mt-3" style="border: 1px solid #e0e0e0">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-center" style="width: 50px; font-weight: bold;">TT</th>
              <th class="text-left" style="font-weight: bold; white-space: nowrap;" v-for="(header, idx) in data.Headers" :key="'h'+idx">{{ header }}</th>
              <th class="text-center" style="font-weight: bold; white-space: nowrap;" v-for="opt in data.Options" :key="opt.id">{{ opt.Text }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rIdx) in data.Rows" :key="row.id">
              <td class="text-center">{{ rIdx + 1 }}</td>
              <td v-for="(val, vIdx) in row.Data" :key="'d'+vIdx">{{ val }}</td>
              <td class="text-center" v-for="opt in data.Options" :key="'o'+opt.id">
                <v-icon color="grey lighten-1">mdi-radiobox-blank</v-icon>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <!-- Mobile View -->
      <div class="d-md-none mt-3">
        <v-card v-for="(row, rIdx) in data.Rows" :key="row.id" class="mb-3" outlined>
          <v-card-text>
            <div class="font-weight-bold mb-1" style="color: black;">{{ rIdx + 1 }}. {{ row.Data[0] || '' }}</div>
            <div v-for="(header, idx) in data.Headers" :key="'mh'+idx" class="mb-1 text-body-2" v-if="idx > 0">
              <strong>{{ header }}:</strong> {{ row.Data[idx] }}
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-around mt-3">
              <div v-for="opt in data.Options" :key="'mo'+opt.id" class="d-flex flex-column align-center">
                <v-icon color="grey lighten-1">mdi-radiobox-blank</v-icon>
                <div class="text-caption mt-1 text-center" style="max-width: 80px; line-height: 1.1">{{ opt.Text }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </template>

    <template v-else>
      <v-textarea v-model="data.Text" class="font-weight-bold" hide-details="auto" flat dense auto-grow :rows="1" placeholder="Tiêu đề bảng bình chọn"></v-textarea>
      <v-textarea v-model="data.Des" auto-grow :rows="1" hide-details="auto" class="py-2" dense flat placeholder="Mô tả"></v-textarea>
      
      <div class="mt-3">
        <div class="font-weight-bold mb-2">Các lựa chọn (Tối đa 3)</div>
        <div v-for="(opt, idx) in data.Options" :key="opt.id" class="d-flex align-center mb-2">
          <v-icon left>mdi-radiobox-blank</v-icon>
          <v-text-field v-model="opt.Text" :placeholder="'Lựa chọn ' + (idx + 1)" hide-details="auto" dense outlined>
            <template v-slot:append-outer>
              <v-btn color="error" @click="removeOption(idx)" icon small :disabled="data.Options.length <= 1">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>
        <v-btn v-if="data.Options.length < 3" color="primary" text small @click="addOption">
          <v-icon left>mdi-plus</v-icon> Thêm lựa chọn
        </v-btn>
      </div>

      <v-divider class="my-4"></v-divider>

      <div>
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="font-weight-bold">Dữ liệu danh sách</div>
          <div class="d-flex ga-2">
            <v-btn color="success" outlined small @click="showExcelPaste = !showExcelPaste">
              <v-icon left>mdi-file-excel</v-icon> Nhập nhanh từ Excel
            </v-btn>
          </div>
        </div>

        <div v-if="showExcelPaste" class="mb-4 pa-3 rounded grey lighten-4">
          <div class="text-caption grey--text mb-2">Dán (paste) dữ liệu trực tiếp từ Excel vào ô bên dưới. Dòng đầu tiên sẽ làm Tiêu đề cột. <strong>Lưu ý:</strong> Dữ liệu cũ sẽ bị ghi đè.</div>
          <v-textarea 
            v-model="pasteData" 
            outlined 
            background-color="white"
            placeholder="Mã NV	Họ và tên	Chức vụ	Đơn vị
NV001	Lâm Thành Hiền	Hiệu trưởng	Ban Giám hiệu" 
            :rows="4" 
            hide-details
            @input="handlePasteData">
          </v-textarea>
          <div v-if="data.Headers && data.Headers.length > 0" class="mt-2 text-caption primary--text">
            Đã nhận diện {{ data.Headers.length }} cột và {{ data.Rows.length }} dòng dữ liệu.
          </div>
        </div>

        <v-simple-table class="mb-3" style="border: 1px solid #e0e0e0; background: #fff">
          <template v-slot:default>
            <thead>
              <tr>
                <th style="width: 40px"></th>
                <th class="text-center" style="width: 50px">#</th>
                <th v-for="(header, idx) in data.Headers" :key="'eh'+idx" class="pa-1">
                  <div class="d-flex align-center">
                    <v-text-field v-model="data.Headers[idx]" hide-details dense flat solo placeholder="Tên cột"></v-text-field>
                    <v-btn icon small color="error" @click="removeColumn(idx)" :disabled="data.Headers.length <= 1">
                      <v-icon small>mdi-close</v-icon>
                    </v-btn>
                  </div>
                </th>
                <th style="width: 50px" class="text-center">
                  <v-btn icon small color="primary" @click="addColumn">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </th>
              </tr>
            </thead>
            <draggable tag="tbody" :list="data.Rows" handle=".drag-row-handle" :animation="200">
              <tr v-for="(row, rIdx) in data.Rows" :key="row.id">
                <td class="pa-1 text-center" style="width: 40px">
                  <v-icon class="drag-row-handle" style="cursor: move;" color="grey">mdi-drag-vertical</v-icon>
                </td>
                <td class="text-center pa-1">{{ rIdx + 1 }}</td>
                <td v-for="(val, cIdx) in row.Data" :key="'ed'+rIdx+'-'+cIdx" class="pa-1">
                  <v-text-field v-model="row.Data[cIdx]" hide-details dense flat solo placeholder="Giá trị"></v-text-field>
                </td>
                <td class="text-center pa-1">
                  <v-btn icon small color="error" @click="removeRow(rIdx)" :disabled="data.Rows.length <= 1">
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </draggable>
          </template>
        </v-simple-table>

        <v-btn color="primary" small outlined @click="addRow">
          <v-icon left>mdi-plus</v-icon> Thêm dòng
        </v-btn>
      </div>
      
      <div>
        <slot :data="data"></slot>
      </div>
    </template>
  </div>
</template>

<script>
	export default {
		name: 'VoteTable',
  props: ['data', 'isEdit'],
  data() {
    return {
      pasteData: '',
      showExcelPaste: false
    }
  },
  watch: {
    isEdit(val) {
      if (!val) {
        this.data.Options = this.data.Options.filter(item => !!item.Text.trim());
        if (this.data.Options.length === 0) {
           this.data.Options.push({ id: crypto.randomUUID().substring(0, 8), Text: "Tùy chọn 1" });
        }
      } else {
        // Build pasteData string when entering edit mode to allow further edits
        if (this.data.Headers && this.data.Rows) {
          const headerStr = this.data.Headers.join('\t');
          const rowsStr = this.data.Rows.map(r => r.Data.join('\t')).join('\n');
          this.pasteData = headerStr + '\n' + rowsStr;
        }
      }
    }
  },
  methods: {
    addOption() {
      if (this.data.Options.length < 3) {
        this.data.Options.push({
          id: crypto.randomUUID().substring(0, 8),
          Text: `Lựa chọn ${this.data.Options.length + 1}`
        })
      }
    },
    removeOption(idx) {
      this.data.Options.splice(idx, 1)
    },
    handlePasteData(val) {
      if (!val || val.trim() === '') return;
      
      const lines = val.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return; // Need at least header and one row
      
      const headers = lines[0].split('\t');
      const rows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split('\t');
        rows.push({
          id: crypto.randomUUID().substring(0, 8),
          QID: "",
          Data: rowData
        });
      }
      
      this.data.Headers = headers;
      this.data.Rows = rows;
    },
    addColumn() {
      this.data.Headers.push("Cột mới");
      this.data.Rows.forEach(row => {
        row.Data.push("");
      });
    },
    removeColumn(idx) {
      this.data.Headers.splice(idx, 1);
      this.data.Rows.forEach(row => {
        row.Data.splice(idx, 1);
      });
    },
    addRow() {
      const emptyData = new Array(this.data.Headers.length).fill("");
      this.data.Rows.push({
        id: crypto.randomUUID().substring(0, 8),
        QID: "",
        Data: emptyData
      });
    },
    removeRow(idx) {
      this.data.Rows.splice(idx, 1);
    }
  },
  created() {
    if (!this.data.Options || this.data.Options.length === 0) {
      this.$set(this.data, 'Options', [
        { id: crypto.randomUUID().substring(0, 8), Text: "Đồng ý" },
        { id: crypto.randomUUID().substring(0, 8), Text: "Không đồng ý" }
      ]);
    }
    if (!this.data.Headers) {
      this.$set(this.data, 'Headers', ["Cột 1", "Cột 2"]);
    }
    if (!this.data.Rows) {
      this.$set(this.data, 'Rows', [
        { id: crypto.randomUUID().substring(0, 8), QID: "", Data: ["Dữ liệu 1", "Dữ liệu 2"] }
      ]);
    }
  }
	}
</script>