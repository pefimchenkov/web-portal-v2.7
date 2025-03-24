<template>
  <v-row justify="center" align="center">
    <v-col cols="12" class="text-center red--text">
      {{ message }}
    </v-col>
    <v-col cols="12">
      <el-upload
        ref="upload"
        action="#"
        class="upload text-center"
        list-type="picture-card"
        :auto-upload="false"
        :limit="3"
        :file-list="attachments"
        :on-exceed="handleExceed"
        :on-change="handleChange"
        multiple
      >
        <i slot="default" class="el-icon-plus" />
        <div slot="file" slot-scope="{file}">
          <img
            class="el-upload-list__item-thumbnail"
            :src="file.url"
            :alt="file.url"
          >
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePictureCardPreview(file)"
            >
              <i class="el-icon-zoom-in" />
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleDownload(file)"
            >
              <i class="el-icon-download" />
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleRemove(file)"
            >
              <i class="el-icon-delete" />
            </span>
          </span>
        </div>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    clear: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      message: null,
      attachments: []
    }
  },
  watch: {
    attachments(val) {
      if (val) {
        this.$emit('attachments', val)
      }
    },
    clear(val) {
      if (val) this.attachments = []
    }
  },
  methods: {
    handleChange(file) {
      this.attachments.push(file)
      this.$refs.upload.abort()
    },
    handleRemove(file) {
      const obj = this.attachments.find(item => item === file)
      const idx = this.attachments.indexOf(obj)
      this.attachments.splice(idx, 1)
      console.log(this.attachments)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleDownload(file) {
      console.log(file)
    },
    handleExceed() {
      this.message = 'Превышен лимит вложений!'
    },
    uploadFiles() {
      const fd = new FormData()
      this.attachments.forEach(file => {
        fd.append('file', file.raw)
      })
      fd.append('id', this.id)
      this.$emit('attachments', fd)
    }
  }
}
</script>

<style scoped>

</style>
