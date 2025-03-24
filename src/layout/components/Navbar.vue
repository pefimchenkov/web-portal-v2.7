<template>
  <div class="navbar">

    <SupportDialog :dialog="dialog" @closeDialog="closeDialog" />

    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">

        <el-tooltip content="Создать обращение в JIRA" effect="dark" placement="bottom">
          <span class="hover-effect right-menu-item">
            <svg-icon id="bullhorn" icon-class="bullhorn" class-name="bullhorn-svg" @click="dialog = true" />
          </span>
        </el-tooltip>

        <error-log class="errLog-container right-menu-item hover-effect" />

        <el-tooltip content="Во весь экран" effect="dark" placement="bottom">
          <screenfull id="screenfull" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="Установить глобально размер элементов" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="Поиск по порталу (временно отключено..)" effect="dark" placement="bottom">
          <search id="header-search" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/profile">
            <el-dropdown-item>Профиль</el-dropdown-item>
          </router-link>
          <router-link to="/">
            <el-dropdown-item>Рабочий стол</el-dropdown-item>
          </router-link>

          <!-- <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a> -->

          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">Выйти</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import SupportDialog from '@/components/shared/SupportDialog'

export default {

  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search,
    SupportDialog
  },

  data() {
    return {

      dialog: false

    }
  },

  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ])
  },

  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    closeDialog(data) {
      this.dialog = !data
    },
    async logout() {
      await this.$store.dispatch('LogoutUser')
      this.$router
      .push(`/login?redirect=${this.$route.fullPath}`)
      .catch(error => {
        console.info(error.message)
      })
    }
  }

}
</script>

<style lang="scss" scoped>

.bullhorn-svg {
  display: inline-block;
  cursor: pointer;
  fill: #44474d;
  font-size: 19px !important;
  vertical-align: -3px;
}

.navbar {
  height: 45px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 15px;
      height: 100%;
      font-size: 16px;
      color: #54585f;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin: 0 30px;

      .avatar-wrapper {
        margin-top: 5px;
        margin-bottom: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          max-height:35px;
          border-radius: 5px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
