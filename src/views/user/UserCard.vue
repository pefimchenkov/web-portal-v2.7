<template>
  <v-container
    v-if="currentUser"
    fluid
    class="elevation-1 grey lighten-4 ma-auto"
  >
    <v-tabs v-model="activeTab" slider-size="1" background-color="white">
      <v-tab href="#tab-data">
        <v-icon small left>mdi-account-tie</v-icon>
        <span>Карточка</span>
      </v-tab>
      <v-tab href="#tab-info">
        <v-icon small left>mdi-account-edit</v-icon>
        <span>Изменить</span>
      </v-tab>
      <v-tab href="#tab-finance">
        <v-icon small left>mdi-cash-multiple</v-icon>
        <span>Финансы</span>
      </v-tab>
      <v-tab v-if="$acl.check('Admin')" href="#tab-bonus">
        <v-icon small left>mdi-sack-percent</v-icon>
        <span>Бонусы</span>
      </v-tab>
      <v-tab href="#tab-filters">
        <v-icon small left>mdi-filter-variant</v-icon>
        <span>Фильтры</span>
      </v-tab>
      <v-tab v-if="$acl.check('Admin')" href="#tab-users">
        <v-icon small left>mdi-account-cowboy-hat</v-icon>
        <span>Админка</span>
      </v-tab>

      <v-tabs-slider />

      <v-tab-item :value="'tab-data'" class="mt-3">
        <v-card class="mx-auto" outlined>
          <v-skeleton-loader
            v-if="localloading"
            ref="skeleton"
            type="list-item-avatar-three-line"
            class="mx-auto"
            tile
          />
          <v-row v-else class="ma-auto">
            <v-col class="text-center" style="margin: auto 0" xs="12" sm="12" md="4" lg="4" xl="4">
              <v-avatar size="300" tile>
                <img v-if="imageSRC" :src="imageSRC" height="350">
                <v-img v-else-if="Photo" class="img" :src="Photo" contain height="100%" />
                <v-img v-else class="img" :src="cardUserImage" contain height="100%" />
              </v-avatar>
            </v-col>
            <v-col xs="12" sm="12" md="8" lg="8" xl="8">
              <v-row>
                <v-col>
                  <v-list>
                    <div class="ma-4">
                      <b>ФИО: </b> {{ Name }}
                    </div>
                    <v-divider />
                    <div class="ma-4">
                      <b>Должность: </b> {{ Position }}
                    </div>
                    <v-divider />
                    <div class="ma-4">
                      <b>Компания: </b> {{ Company }}
                    </div>
                    <v-divider />
                  </v-list>
                </v-col>
                <v-col>
                  <v-list>
                    <div class="ma-4">
                      <b>Email: </b> {{ Email }}
                    </div>
                    <v-divider />
                    <div class="ma-4">
                      <b>Телефон: </b> {{ Phone }}
                    </div>
                    <v-divider />
                    <div class="ma-4">
                      <b>Роль: </b> {{ UserRole | translateRoles(UserRole) }}
                    </div>
                    <v-divider />
                  </v-list>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <div class="ma-4">
                    <b>О себе: </b> {{ AboutMe }}
                  </div>
                  <v-divider />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row justify="center" align="center">
            <input
              ref="fileInput"
              type="file"
              style="display:none"
              accept="image/*"
              @change="onFileChange"
            >
            <v-col class="text-center pa-5">
              <v-btn
                v-if="image === null"
                :loading="localloading"
                class="success"
                @click="triggerUpload"
              >
                Обновить аватар
              </v-btn>
              <template v-else>
                <v-btn
                  :loading="localloading"
                  class="success"
                  @click="uploadPhoto"
                >
                  Сохранить фото
                </v-btn>
                <v-btn
                  :loading="localloading"
                  class="warning ml-10"
                  @click="clearInput"
                >
                  Отменить
                </v-btn>
              </template>
            </v-col>
          </v-row>
        </v-card>
      </v-tab-item>

      <v-tab-item :value="`tab-info`" class="mt-3">
        <EditProfile />
      </v-tab-item>

      <v-tab-item :value="`tab-finance`" class="mt-3">
        <Finance />
      </v-tab-item>

      <v-tab-item v-if="$acl.check('Admin')" :value="'tab-bonus'" class=" mt-3">
        <Bonus />
      </v-tab-item>

      <v-tab-item :value="'tab-filters'" class="mt-3">
        <v-card outlined>
          <v-treeview
            :items="items"
            :active.sync="active"
            :open.sync="open"
            activatable
            :load-children="getFiltersName"
            hoverable
            active-class="success--text"
            class="pa-2"
            open-on-click
          >
            <template slot="label" slot-scope="props">
              <v-icon :color="active ? 'success' : ''">
                {{ props.item.icon }}
              </v-icon>
              <v-icon
                v-if="props.item.deletable"
                :color="props.item.share ? 'green' : 'grey'"
                @click="setFilterShare($event, props.item.name)"
              >
                mdi-share-variant
              </v-icon>
              <v-icon
                v-if="props.item.deletable"
                @click="delFilter(props.item.name)"
              >
                mdi-delete-forever
              </v-icon>
              <span
                v-if="props.item.deletable"
                @click="routeToMyFilter(props.item.name)"
              >{{ props.item.name }}</span>
              <span v-else>{{ props.item.name }}</span>
            </template>
          </v-treeview>
          <v-treeview
            :items="sharedItems"
            :active.sync="activeShare"
            :open.sync="openShare"
            activatable
            :load-children="getSharedFiltersName"
            hoverable
            active-class="success--text"
            class="pa-2"
            open-on-click
          >
            <template slot="label" slot-scope="props">
              <v-icon :color="activeShare ? 'success' : ''">
                {{ props.item.icon }}
              </v-icon>
              <span
                @click="
                  routeToSharedFilter(
                    props.item.name,
                    props.item.user,
                    props.item.key,
                    props.item.payload
                  )
                "
              >{{ props.item.name }}</span>
            </template>
          </v-treeview>
        </v-card>
      </v-tab-item>

      <v-tab-item :value="'tab-users'" class="mt-3">
        <Users />
      </v-tab-item>

    </v-tabs>
  </v-container>

  <v-container v-else fluid>
    <v-layout row>
      <v-flex xs12 class="text-center pt-5">
        <v-progress-circular
          :size="100"
          color="primary"
          indeterminate
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import EditProfile from './EditProfileForm'
import Bonus from './bonus/index.vue'
import Finance from '@/views/finance/index.vue'
import Users from '@/views/admin/users/index.vue'

import fb from 'firebase/app'

import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

import GetConfig from '@/services/GetConfig'
import _ from 'lodash'

import { mapState } from 'vuex'
import { translateRoles } from '@/filters/translateRoles'

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
  name: 'UserCard',
  components: {
    EditProfile,
    Bonus,
    Finance,
    Users
  },
  filters: {
    translateRoles
  },
  props: {
    cardUserImage: {
      type: String,
      default: require('@/assets/img/users/noname.png')
    }
  },
  data() {
    return {
      data: [],
      activeTab: 'tab-data',
      active: [1111],
      activeShare: [],
      filterNames: [],
      sharedFilterNames: [],
      colorShare: '',
      nameShare: '',
      open: [],
      openShare: [],
      Filters: [],
      SharedFilters: [],
      item: null,
      UserName: '',
      formData: new FormData(),
      image: null,
      imageSRC: null,
      show: false,
      localloading: false
    }
  },
  computed: {
    ...mapState({
      info: state => state.user.info
    }),
    UserRole() {
      return this.$store.getters.userRole || 'нет данных'
    },
    currentUser() {
      return this.$store.getters.currentUser
    },
    Name() {
      return this.info.firstname + ' ' + this.info.lastname || 'нет данных'
    },
    Company() {
      return this.info.company || 'нет данных'
    },
    Position() {
      return this.info.position || 'нет данных'
    },
    Photo() {
      return this.currentUser
        ? this.currentUser.providerData[0].photoURL
        : null
    },
    Email() {
      return this.currentUser.providerData[0].email || 'нет данных'
    },
    Phone() {
      return this.info.phone || 'нет данных'
    },
    AboutMe() {
      return this.info.aboutme || 'нет данных'
    },

    items() {
      return [
        {
          id: 1001,
          name: 'Мои фильтры',
          children: this.filterNames,
          icon: 'filter_list',
          linkLess: true
        }
      ]
    },
    sharedItems() {
      return [
        {
          id: 2002,
          name: 'Общие фильтры',
          children: this.sharedFilterNames,
          icon: 'filter_list',
          linkLess: true
        }
      ]
    }
  },

  async created() {
    await GetConfig.getMyFilters()
      .then(filters => {
        if (filters) {
          Object.entries(filters).forEach((filter, index) => {
            const obj = []
            Object.entries(filter[1]).forEach(entry => {
              obj.push({
                id: Math.ceil(Math.random() * 10000),
                name: entry[0],
                deletable: true,
                share: entry[1].Share
              })
            })
            this.Filters.push({
              id: Math.ceil(Math.random() * 10000),
              name: filter[0],
              children: obj
            })
          })
        } else {
          return false
        }
      })
      .catch(err => {
        this.$store.commit('setError', err)
      })

    await GetConfig.getSharedFilterNames()
      .then(users => {
        const hasFilters = _.filter(users, 'filters')
        var arr = []
        hasFilters.forEach((obj, index) => {
          var SF = {
            id: null,
            name: '(' + index + ')',
            children: []
          }
          SF['id'] = Math.ceil(Math.random() * 22222)
          if (obj.info && obj.info.lastname) {
            SF['name'] = obj.info.lastname
          } else if (obj.info && !obj.info.lastname && obj.info.emailaddress) {
            SF['name'] = obj.info.emailaddress
          } else {
            SF['name'] += ' не заполнено'
          }
          for (var key in obj.filters) {
            _.forIn(obj.filters[key], function(v, k) {
              if (v.Share === true) {
                arr.push({
                  id: Math.ceil(Math.random() * 22222),
                  name: k,
                  user: SF['name'],
                  key: key,
                  payload: v
                })
              }
            })
          }
          SF['children'] = arr.filter(f => f.user === SF['name'])
          if (SF['children'].length !== 0) {
            this.SharedFilters.push(SF)
          }
        })
      })
      .then(() => {
        this.$store.dispatch('getUserInfo')
      })
  },

  async mounted() {
    this.localloading = true
    await pause(2000)
    await this.currentUser
      ? this.localloading = false
      : this.$store.commit('setError', 'Текущий пользователь не найден. Обратитесь к администратору портала.')
  },

  methods: {
    triggerUpload() {
      this.$refs.fileInput.click()
    },
    clearInput() {
      this.image = this.imageSRC = null
      this.$refs.fileInput.value = null
    },
    onFileChange(event) {
      const file = event.target.files[0]
      if (file.size > 2048 * 2048) {
        event.preventDefault()
        this.$store.dispatch(
          'setError',
          'Размер файла превышает допустимый порог в 4 МБ!'
        )
        return
      } else if (!file.type.match('image.*')) {
        event.preventDefault()
        this.$store.dispatch(
          'setError',
          'Выбранный файл не является изображением!'
        )
        return
      }
      const reader = new FileReader()
      reader.onload = e => {
        this.imageSRC = reader.result
      }
      reader.readAsDataURL(file)
      this.image = file
      this.formData.append('id', this.ID)
      this.formData.append('image', this.image)
    },
    async uploadPhoto() {
      const user = fb.auth().currentUser
      if (this.imageSRC) {
        this.show = true
        const imageExt = this.image.name.slice(this.image.name.lastIndexOf('.'))
        this.localloading = true
        const imageSRC = await fb
          .storage()
          .ref(`users/photos/${user.uid}.${imageExt}`)
          .put(this.image)
          .then(snapshot => {
            return snapshot.ref.getDownloadURL()
          })
        await user
          .updateProfile({
            photoURL: imageSRC
          })
          .then(() => {
            this.$store.dispatch('setData', 'Фото успешно сохранено!')
            this.localloading = false
            this.image = null
          })
          .catch(function(error) {
            if (error) {
              this.$store.dispatch('setError', error.message)
            }
          })
        this.imageSRC = imageSRC
      }
    },

    async getSharedFiltersName(item) {
      await pause(1000)
      return new Promise((resolve, reject) => {
        resolve(this.SharedFilters)
      })
        .then(json => {
          item.children.push(...json)
        })
        .catch(err => console.warn(err))
    },
    async getFiltersName(item) {
      await pause(1000)
      return new Promise((resolve, reject) => {
        resolve(this.Filters)
      })
        .then(json => {
          item.children.push(...json)
        })
        .catch(err => console.warn(err))
    },

    routeToMyFilter(name) {
      this.Filters.forEach(filter => {
        for (var obj of filter.children) {
          if (obj.name === name) {
            var filterName = filter.name
          }
        }
        if (filterName === 'Маркет') {
          this.$router.push({ path: '/market/list/', query: { market: name }})
        }
        if (filterName === 'ЗИП') {
          this.$router.push({ path: '/zip/list/', query: { zip: name }})
        }
      })
    },

    routeToSharedFilter(filterName, userID, key, payload) {
      if (key === 'Маркет') {
        this.$router.push({
          path: '/market/list/',
          query: { userID: userID, filterName: filterName, payload: payload }
        })
      }
      if (key === 'ЗИП') {
        this.$router.push({
          path: '/zip/list/',
          query: { userID: userID, filterName: filterName, payload: payload }
        })
      }
    },

    delFilter(name) {
      if (confirm('Вы уверены, что хотите удалить этот Фильтр?')) {
        this.Filters.forEach(filter => {
          filter.children.forEach(async child => {
            if (child.name === name) {
              delete filter.children[filter.children.indexOf(child)]
              const payload = { childName: name, filterName: filter.name }
              this.$store.dispatch('delFilter', payload).then(() => {
                this.$store.commit('setData', 'Удаление прошло успешно!')
              })
            }
          })
        })
      } else {
        this.$store.commit('setLoading', false)
        this.$store.commit('setInfo', 'Удаление отменено')
      }
    },

    async setFilterShare(e, name) {
      const id = await parentName(this.Filters)
      this.$store.dispatch('setFilterShare', { id, name }).then(result => {
        this.$store.commit(
          'setInfo',
          result.shareStatus
            ? 'Общий доступ для фильтра "' + result.name + '" установлен.'
            : 'Общий доступ для фильтра "' + result.name + '" снят.'
        )
        if (result.shareStatus) {
          e.target.classList.add('greenClass')
          e.target.classList.remove('greyClass')
        } else {
          e.target.classList.add('greyClass')
          e.target.classList.remove('greenClass')
        }
      })
      function parentName(arr) {
        return new Promise((resolve, reject) => {
          arr.forEach(filter => {
            if (
              !_.isEmpty(
                _.pickBy(filter.children, val => val.name === name.toString())
              )
            ) {
              return resolve(filter.name)
            }
          })
        })
      }
    }
  }
}
</script>

<style scouped>
.card-panel-icon {
      margin-right: 8px;
      font-size: 24px;
    }
.cursor {
	cursor: pointer;
}
.text-menu {
  font-weight: 600;
}
.cursor:hover {
	background-color: #f5f5f5;
}
.align_center {
	width: 100%;
}
.v-treeview-node__label {
	font-size: 1em !important;
}
.wdt {
	max-width: 300px;
}
.greenClass {
	color: #4caf50 !important;
}
.greyClass {
	color: grey !important;
}
.vertical-tabs [role='tab'] {
	justify-content: flex-start;
}
</style>
