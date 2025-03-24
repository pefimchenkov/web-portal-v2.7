<template>
  <v-container v-loading="loading" fluid>

    <manualAddZip ref="addZip" :engineers="engineers" />

    <Confirm ref="confirm" />

    <el-tabs v-model="active" stretch @tab-click="handleClick">

      <el-tab-pane label="Рабочий стол" name="workdesk">

        <v-row dense class="green text-center mt-3" :style="`color: #fff`">
          <v-col>Новые ЗИП</v-col>
          <v-col cols="1">
            <el-button circle size="mini" plain icon="el-icon-plus" @click="addZip(2)" />
          </v-col>
        </v-row>

        <!-- Таблица Новый ЗИП -->

        <v-data-table
          :headers="headers_good"
          :items="newData"
          calculate-widths
          item-key="id"
          :mobile-breakpoint="550"
          sort-by="id"
          no-data-text="Данные отсутствуют."
          sort-desc
          class="elevation-2 ma-3"
          dense
          :footer-props="{
            itemsPerPageAllText: 'Все',
            itemsPerPageText: 'Строк на странице',
            itemsPerPageOptions: [10,50,250,-1],
            showFirstLastPage: true
          }"
        >
          <template #[`item.zip`]="{ item }">
            <v-tooltip top max-width="500">
              <template #activator="{ on }">
                <span v-on="on" @mouseover="getModelList(item.zip_id)">{{ item.zip }}</span>
              </template>
              <span>{{ modelList.data }}</span>
            </v-tooltip>
          </template>
          <template #[`item.isskey`]="{ item }">
            <a icon :href="settings.jira_url + item.isskey" target="_blank">
              {{ item.isskey }}
            </a>
          </template>
          <template #[`item.eng`]="{ item }">
            {{ showName(item.eng) }}
          </template>
          <template #[`item.executor`]="{ item }">
            {{ showName(item.executor) }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-tooltip top>
              <template #activator="{ on }">
                <v-btn v-if="user === getEmail(item.eng) || $acl.check('LeadEngineer')" class="mx-2" x-small icon @click.prevent="delItem(item)" v-on="on">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Вернуть в нераспределённый</span>
            </v-tooltip>
            <v-tooltip v-if="!item.request" top>
              <template #activator="{ on }">
                <v-btn v-if="$acl.check('LeadEngineer')" class="mx-2" x-small icon @click.prevent="sendRequest(item)" v-on="on">
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </template>
              <span>Поставить в резерв</span>
            </v-tooltip>
            <v-tooltip v-if="item.request === 1" top>
              <template #activator="{ on }">
                <v-btn v-if="$acl.check('LeadEngineer')" class="mx-2" x-small icon v-on="on" @click.prevent="sendApprove(item)">
                  <v-icon>done</v-icon>
                </v-btn>
              </template>
              <span>Подтвердить</span>
            </v-tooltip>
          </template>
          <template #[`item.status`]="{ item }">
            <v-tooltip v-if="item.sklad === 2" top>
              <template #activator="{ on }">
                <span top v-on="on">
                  <v-icon small>pan_tool</v-icon>
                </span>
              </template>
              <span>Добавлен в ручную</span>
            </v-tooltip>
            <v-tooltip v-if="item.request === 1" top>
              <template #activator="{ on }">
                <span v-on="on">
                  <v-icon small>mdi-check-circle-outline</v-icon>
                  <v-icon small>mdi-clock-outline</v-icon>
                </span>
              </template>
              <span>В резерве</span>
            </v-tooltip>
          </template>
          <template #[`item.date`]="{item}">
            {{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
          </template>
          <template #[`item.comment`]="{ item }">
            <v-edit-dialog
              ref="custom"
              :return-value.sync="item.comment"
              large
              persistent
              cancel-text="Отмена"
              save-text="Сохранить"
              @save="saveComment(item.id, item.comment)"
            >
              <v-icon x-small class="mr-3">mdi-pencil</v-icon>{{ item.comment }}
              <template #input>
                <v-text-field
                  v-model="item.comment"
                  label="Редактирование"
                  single-line
                  counter
                  autofocus
                />
              </template>
            </v-edit-dialog>
          </template>
        </v-data-table>

        <!-- Таблица ЗИП Можно восстановить -->

        <v-row dense class="orange text-center" :style="`color: #fff`">
          <v-col>Можно восстановить</v-col>
          <v-col cols="1">
            <el-button circle size="mini" icon="el-icon-plus" plain @click="addZip(1)" />
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers_good"
          :items="refData"
          calculate-widths
          :items-per-page="10"
          item-key="id"
          :mobile-breakpoint="550"
          sort-by="id"
          no-data-text="Данные отсутствуют."
          sort-desc
          class="elevation-2 ma-3"
          dense
          :footer-props="{
            itemsPerPageAllText: 'Все',
            itemsPerPageText: 'Строк на странице',
            itemsPerPageOptions: [10,50,250,-1],
            showFirstLastPage: true
          }"
        >
          <template #[`item.zip`]="{ item }">
            <v-tooltip top max-width="500">
              <template #activator="{ on }">
                <span v-on="on" @mouseover="getModelList(item.zip_id)">{{ item.zip }}</span>
              </template>
              <span>{{ modelList.data }}</span>
            </v-tooltip>
          </template>
          <template #[`item.eng`]="{item}">
            {{ showName(item.eng) }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-tooltip top>
              <template #activator="{ on }">
                <v-btn v-if="user === getEmail(item.eng) || $acl.check('LeadEngineer')" class="mx-2" x-small icon @click.prevent="delItem(item)" v-on="on">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Вернуть в нераспределённый</span>
            </v-tooltip>
            <v-tooltip v-if="!item.request" top>
              <template #activator="{ on }">
                <v-btn v-if="$acl.check('LeadEngineer')" class="mx-2" x-small icon @click.prevent="sendRequest(item)" v-on="on">
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </template>
              <span>Поставить в резерв</span>
            </v-tooltip>
            <v-tooltip v-if="item.request === 2" top>
              <template #activator="{ on }">
                <v-btn v-if="$acl.check('LeadEngineer')" class="mx-2" x-small icon v-on="on" @click.prevent="sendApprove(item)">
                  <v-icon>done</v-icon>
                </v-btn>
              </template>
              <span>Подтвердить</span>
            </v-tooltip>
            <v-tooltip v-if="item.request === 1 && item.type === 1" top>
              <template #activator="{ on }">
                <v-btn v-if="$acl.check('LeadEngineer')" class="mx-2" x-small icon v-on="on" @click.prevent="sendCheck(item)">
                  <v-icon>mdi-screwdriver</v-icon>
                </v-btn>
              </template>
              <span>Взять на проверку</span>
            </v-tooltip>
            <v-tooltip v-if="item.request === 2" top>
              <template #activator="{ on }">
                <v-btn v-if="$acl.check('LeadEngineer')" class="mx-2" x-small icon @click.prevent="sendDecline(item)" v-on="on">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
              <span>Отклонить</span>
            </v-tooltip>

          </template>
          <template #[`item.isskey`]="{ item }">
            <a icon :href="settings.jira_url + item.isskey" target="_blank">
              {{ item.isskey }}
            </a>
          </template>
          <template #[`item.executor`]="{ item }">
            {{ showName(item.executor) }}
          </template>
          <template #[`item.status`]="{ item }">
            <v-tooltip v-if="item.sklad === 2" top>
              <template #activator="{ on }">
                <div v-on="on">
                  <v-icon small>pan_tool</v-icon>
                </div>
              </template>
              <span>Добавлен в ручную</span>
            </v-tooltip>
            <v-tooltip v-if="item.request === 1" top>
              <template #activator="{ on }">
                <div v-on="on">
                  <v-icon small>mdi-check-circle-outline</v-icon>
                  <v-icon small>mdi-clock-outline</v-icon>
                </div>
              </template>
              <span>В резерве</span>
            </v-tooltip>
            <v-tooltip v-if="item.request === 2" top>
              <template #activator="{ on }">
                <div v-on="on">
                  <v-icon small>mdi-screwdriver</v-icon>
                  <v-icon small>mdi-clock-outline</v-icon>
                </div>
              </template>
              <span>На проверке</span>
            </v-tooltip>
          </template>
          <template #[`item.date`]="{item}">
            {{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
          </template>
          <template #[`item.comment`]="{ item }">
            <v-edit-dialog
              ref="custom"
              :return-value.sync="item.comment"
              large
              persistent
              cancel-text="Отмена"
              save-text="Сохранить"
              @save="saveComment(item.id, item.comment)"
            >
              <v-icon x-small class="mr-3">mdi-pencil</v-icon>{{ item.comment }}
              <template #input>
                <v-text-field
                  v-model="item.comment"
                  label="Редактирование"
                  single-line
                  counter
                  autofocus
                />
              </template>
            </v-edit-dialog>
          </template>
        </v-data-table>

        <!-- Таблица Нераспределённый ЗИП -->

        <p class="text-center grey py-2" :style="`color: #fff`">Нераспределённые</p>

        <v-data-table
          :headers="computedHeaders"
          :items="engineersStock"
          calculate-widths
          item-key="id"
          :mobile-breakpoint="550"
          sort-by="Count"
          no-data-text="Данные отсутствуют."
          sort-desc
          dense
          class="elevation-2 ma-3"
          :footer-props="{
            itemsPerPageAllText: 'Все',
            itemsPerPageText: 'Строк на странице',
            itemsPerPageOptions: [50,150,500,-1],
            showFirstLastPage: true
          }"
        >
          <template #[`body.prepend`]>
            <td colspan="1" />
            <td colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'Zip')">
              <v-text-field v-model="filters.Zip" clearable type="text" />
            </td>
            <td colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'Content')">
              <v-text-field v-model="filters.Content" clearable type="text" />
            </td>
            <td colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'Eng')">
              <v-autocomplete
                v-model="filters.Eng"
                :items="engineers"
                item-text="display_name"
                clearable
                return-object
              />
            </td>
            <td colspan="1" />
          </template>
          <template #[`item.Zip`]="{ item }">
            <v-tooltip max-width="500" top>
              <template #activator="{ on }">
                <span v-on="on" @mouseover="getModelList(item.JIRA_ID)">{{ item.Zip }}</span>
              </template>
              <span>{{ modelList.data }}</span>
            </v-tooltip>
          </template>
          <template #[`item.isskey`]="{ item }">
            <a icon :href="settings.jira_url + item.isskey" target="_blank">
              {{ item.isskey }}
            </a>
          </template>
          <template #[`item.Eng`]="{ item }">
            {{ showName(item.Eng) }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-btn text fab small left :to="{ name: 'engineers_stock_details', params: { id: item.JIRA_ID, eng: item.Eng ? item.Eng : 'null', activeTab: active } }">
              <v-icon>more_horiz</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </el-tab-pane>

      <!-- ТАБ АРХИВ -->

      <el-tab-pane label="Архив" name="archive">
        <p class="text-center mt-3" :style="`background-color: #f74d6c; color: #fff`">Отстутствующие ЗИП</p>

        <!-- Таблица Отстутствующие ЗИП -->

        <v-data-table
          :headers="headers_good"
          :items="missingData"
          calculate-widths
          item-key="id"
          :mobile-breakpoint="550"
          sort-by="Count"
          no-data-text="Данные отсутствуют."
          sort-desc
          class="elevation-2 ma-3"
          dense
          :footer-props="{
            itemsPerPageAllText: 'Все',
            itemsPerPageAllText: 'Строк на странице',
            itemsPerPageOptions: [10,50,250,-1],
            showFirstLastPage: true
          }"
        >
          <template #[`item.isskey`]="{ item }">
            <a icon :href="settings.jira_url + item.isskey" target="_blank">
              {{ item.isskey }}
            </a>
          </template>
          <template #[`item.eng`]="{item}">
            {{ showName(item.eng) }}
          </template>
          <template #[`item.executor`]="{item}">
            {{ showName(item.executor) }}
          </template>
          <template #[`item.date`]="{item}">
            {{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
          </template>
        </v-data-table>

        <!-- Таблица Архив Операций -->

        <p class="text-center primary" :style="`color: #fff`">Архив операций</p>

        <v-data-table
          ref="archiveOperations"
          :headers="computedHeadersOperationArchive"
          :items="archiveOperations"
          item-key="id"
          :mobile-breakpoint="550"
          sort-by="date"
          sort-desc
          class="elevation-2 ma-3"
          dense
          :footer-props="{
            itemsPerPageAllText: 'Все',
            itemsPerPageAllText: 'Строк на странице',
            itemsPerPageOptions: [10,50,250,-1],
            showFirstLastPage: true
          }"
        >
          <template #[`body.prepend`]>
            <tr>
              <td
                v-for="header in computedHeadersOperationArchive"
                :key="header.zip_id"
              >
                <v-text-field
                  v-if="header.value === 'Bonus' && $refs.archiveOperations"
                  v-model="bonusSum"
                  type="text"
                  readonly
                />
                <v-autocomplete
                  v-if="header.value === 'eng'"
                  v-model="filters.GoodEng"
                  :items="engineers"
                  item-text="display_name"
                  clearable
                  return-object
                />
                <template v-if="header.value === 'date'">
                  <v-menu
                    ref="menuGoodDate"
                    v-model="menuGoodDate"
                    :close-on-content-click="false"
                    transition="scale-transition"
                  >
                    <template #activator="{ on }">
                      <v-icon :color="filters.GoodDate !== null && filters.GoodDate.length > 0 ? `green darken-2` : ``" v-on="on">event</v-icon>
                    </template>
                    <v-date-picker v-model="filters.GoodDate" multiple no-title>
                      <div class="flex-grow-1" />
                      <v-btn text color="primary" @click="menuGoodDate = false">Отмена</v-btn>
                      <v-btn text color="primary" @click="$refs.menuGoodDate[0].save(filters.GoodDate)">OK</v-btn>
                    </v-date-picker>
                  </v-menu>
                  <v-icon v-if="filters.GoodDate !== null && filters.GoodDate.length > 0" @click="filters.GoodDate = []">clear</v-icon>
                </template>
              </td>
            </tr>
          </template>
          <template #[`item.eng`]="{ item }">
            {{ showName(item.eng) }}
          </template>
          <template #[`item.Cost`]="{ item }">
            {{ item.Cost | ruFormatCurrency }}
          </template>
          <template #[`item.status`]="{ item }">
            <v-icon v-if="item.request === 0" color="error" small>mdi-close</v-icon>
            <v-icon v-else color="success" small>done</v-icon>
            <v-icon v-if="item.sklad === 2" small>pan_tool</v-icon>
          </template>
          <template #[`item.date`]="{ item }">
            {{ item.date ? new Date(item.date).toLocaleDateString('ru-RU', { hour: 'numeric', minute: 'numeric' }) : '' }}
          </template>
          <template #[`item.isskey`]="{ item }">
            <a icon :href="settings.jira_url + item.isskey" target="_blank">
              {{ item.isskey }}
            </a>
          </template>
          <template #[`item.executor`]="{ item }">
            {{ showName(item.executor) }}
          </template>
        </v-data-table>

        <!-- Таблица Нераспределённые Архив -->

        <p class="text-center grey" :style="`color: #fff`">Нераспределённые Архив</p>
        <v-data-table
          :headers="computedHeadersArchive"
          :items="engineersStockArchive"
          item-key="id"
          calculate-widths
          :mobile-breakpoint="550"
          sort-by="Count"
          no-data-text="Данные отсутствуют."
          sort-desc
          dense
          class="elevation-2 ma-3"
          :footer-props="{
            itemsPerPageAllText: 'Все',
            itemsPerPageAllText: 'Строк на странице',
            itemsPerPageOptions: [50,150,500,-1],
            showFirstLastPage: true
          }"
        >
          <template #[`body.prepend`]>
            <td colspan="1" />
            <td colspan="1" />
            <td v-if="computedHeadersArchive.find(header => header.value === 'Zip')">
              <v-text-field v-model="filters.ArchiveZip" clearable type="text" />
            </td>
            <td colspan="1" />
            <td v-if="computedHeadersArchive.find(header => header.value === 'Content')">
              <v-text-field v-model="filters.ArchiveContent" clearable type="text" />
            </td>
            <td colspan="1" />
            <td v-if="computedHeadersArchive.find(header => header.value === 'Eng')">
              <v-autocomplete
                v-model="filters.ArchiveEng"
                :items="engineers"
                item-text="display_name"
                clearable
                return-object
              />
            </td>
            <td colspan="1" />
          </template>
          <template #[`item.isskey`]="{ item }">
            <a icon :href="settings.jira_url + item.isskey" target="_blank">
              {{ item.isskey }}
            </a>
          </template>
          <template #[`item.Eng`]="{ item }">
            {{ showName(item.Eng) }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-btn text fab small left :to="{ name: 'engineers_stock_details', params: { id: item.JIRA_ID, eng: item.Eng ? item.Eng : 'null', activeTab: active } }">
              <v-icon>more_horiz</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </el-tab-pane>

    </el-tabs>

  </v-container>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import Confirm from '@/components/shared/Confirm'
import manualAddZip from './manualAddZip'
import settings from '@/settings.js'
import { formatDate } from '@/services/helpers'
import { ruFormatCurrency } from '@/filters/ruFormatCurrency'

import { getModelList } from '@/api/engineers-stock'

export default {

  components: {

    Confirm,
    manualAddZip

  },

  filters: {

    ruFormatCurrency

  },

  props: {

    engineersStock: {

      type: Array,
      required: true

    },

    engineersStockArchive: {

      type: Array,
      required: true

    },

    engineersStockGood: {

      type: Array,
      required: true

    }

  },

  data() {
    return {

      prop: '',
      settings,
      loading: false,
      active: 'tab-workdesk',
      menuGoodDate: false,
      modelList: '',

      filters: {
        Content: '',
        Zip: '',
        Eng: [],
        GoodEng: [],
        GoodDate: [],
        ArchiveContent: '',
        ArchiveZip: '',
        ArchiveEng: []
      },

      editedItem: {},

      editedIndex: null,

      headers: [
        { text: 'Маркет ID',
          value: 'element',
          selected: true,
          divider: true
        },
        { text: 'ЗИП ID',
          value: 'JIRA_ID',
          selected: true,
          divider: true
        },
        { text: 'ЗИП',
          value: 'Zip',
          selected: true,
          divider: true,
          filter: value => {
            if (!this.filters.Zip) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.Zip.toLowerCase())
          }
        },
        { text: 'Количество',
          value: 'Count',
          selected: true,
          divider: true
        },
        { text: 'Контент',
          value: 'Content',
          selected: true,
          divider: true,
          filter: value => {
            if (!this.filters.Content) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.Content.toLowerCase())
          }
        },
        { text: 'Состав',
          value: 'ContentNum',
          selected: true,
          divider: true
        },
        { text: 'Инженер',
          value: 'Eng',
          selected: true,
          divider: true,
          filter: value => {
            if (!this.filters.Eng || this.filters.Eng.length === 0) return true
            return (value ? value.includes(this.filters.Eng.user_name) : false)
          }
        },
        { text: 'Действия',
          value: 'action',
          selected: true,
          divider: true
        }
      ],

      headers_archive: [
        { text: 'Маркет ID',
          value: 'element',
          selected: true,
          divider: true
        },
        { text: 'ЗИП ID',
          value: 'JIRA_ID',
          selected: true,
          divider: true
        },
        { text: 'ЗИП',
          value: 'Zip',
          selected: true,
          divider: true,
          filter: value => {
            if (!this.filters.ArchiveZip) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.ArchiveZip.toLowerCase())
          }
        },
        { text: 'Количество',
          value: 'Count',
          selected: true,
          divider: true
        },
        { text: 'Контент',
          value: 'Content',
          selected: true,
          divider: true,
          filter: value => {
            if (!this.filters.ArchiveContent) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.ArchiveContent.toLowerCase())
          }
        },
        { text: 'Состав',
          value: 'ContentNum',
          selected: true,
          divider: true
        },
        { text: 'Инженер',
          value: 'Eng',
          selected: true,
          divider: true,
          filter: value => {
            if (!this.filters.ArchiveEng || this.filters.ArchiveEng.length === 0) return true
            return (value ? value.includes(this.filters.ArchiveEng.user_name) : false)
          }
        },
        { text: 'Действия',
          value: 'action',
          selected: true,
          divider: true
        }
      ],

      headers_good: [
        { text: 'ЗИП ID',
          value: 'zip_id',
          selected: true,
          divider: true
        },
        { text: 'ЗИП',
          value: 'zip',
          selected: true,
          divider: true
        },
        { text: '1С Артикул',
          value: 'arts',
          selected: true,
          divider: true
        },
        { text: 'Инженер',
          value: 'eng',
          selected: true,
          width: 230,
          divider: true,
          filter: value => {
            if (!this.filters.GoodEng || this.filters.GoodEng.length === 0) return true
            return (value ? value.includes(this.filters.GoodEng.user_name) : false)
          }
        },
        { text: 'Номер задачи',
          value: 'isskey',
          selected: true,
          divider: true
        },
        { text: 'Комментарий',
          value: 'comment',
          selected: true,
          divider: true
        },
        { text: 'Себестоимость',
          value: 'Cost',
          selected: true,
          align: 'center',
          divider: true
        },
        { text: 'Баллы',
          value: 'Bonus',
          selected: true,
          align: 'center',
          divider: true
        },
        { text: 'Статус',
          value: 'status',
          selected: true,
          align: 'center',
          divider: true
        },
        { text: 'Дата',
          value: 'date',
          selected: true,
          width: 150,
          align: 'center',
          divider: true
        },
        { text: 'Отправитель',
          value: 'executor',
          selected: true,
          align: 'center',
          divider: true
        },
        { text: 'Действия',
          value: 'action',
          align: 'left',
          selected: true
        }
      ],

      headers_operation_archive: [
        { text: 'ЗИП ID',
          value: 'zip_id',
          selected: true,
          divider: true
        },
        { text: 'ЗИП',
          value: 'zip',
          selected: true,
          divider: true
        },
        { text: '1С Артикул',
          value: 'arts',
          selected: true,
          divider: true
        },
        { text: 'Инженер',
          value: 'eng',
          selected: true,
          width: 230,
          divider: true,
          filter: value => {
            if (!this.filters.GoodEng || this.filters.GoodEng.length === 0) return true
            return (value ? value === this.filters.GoodEng.user_name : false)
          }
        },
        { text: 'Номер задачи',
          value: 'isskey',
          selected: true,
          divider: true
        },
        { text: 'Комментарий',
          value: 'comment',
          selected: true,
          divider: true
        },
        { text: 'Себестоимость',
          value: 'Cost',
          selected: true,
          align: 'center',
          divider: true
        },
        { text: 'Баллы',
          value: 'Bonus',
          selected: true,
          align: 'center',
          divider: true
        },
        { text: 'Статус',
          value: 'status',
          selected: true,
          align: 'center',
          divider: true
        },
        { text: 'Дата',
          value: 'date',
          selected: true,
          width: 150,
          align: 'center',
          divider: true,
          filter: value => {
            if (!this.filters.GoodDate || this.filters.GoodDate.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const Arr = this.filters.GoodDate.map(item => moment(item).unix())
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            return (moment(formatDate(value)).unix() >= first && moment(formatDate(value)).unix() <= last)
          }
        },
        { text: 'Отправитель',
          value: 'executor',
          selected: true,
          align: 'center',
          divider: true
        },
        { text: 'Действия',
          value: 'action',
          align: 'left',
          selected: true
        }
      ]

    }
  },

  computed: {

    computedHeaders() {
      return this.headers.filter(header => header.selected)
    },

    computedHeadersArchive() {
      return this.headers_archive.filter(header => header.selected)
    },

    computedHeadersGood() {
      return this.headers_good.filter(header => header.selected)
    },

    computedHeadersOperationArchive() {
      return this.headers_operation_archive.filter(header => header.selected)
    },

    bonusSum() {
      const filteredSum = this.$refs.archiveOperations.$children[0].filteredItems.map(arr => arr.Bonus)
      return Math.round(_.sum(filteredSum))
    },

    engineers() {
      const filtered = _.filter(_.uniqBy(this.engineersStock, 'Eng'), obj => obj.Eng !== null)
      return this.jiraUsers.filter(user => (filtered.find(item => item.Eng === user.user_name)) || user.user_name === 'vav' || user.user_name === 'zsa' || user.user_name === 'i.volnov' || user.user_name === 'a.subbotin')
    },

    user() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.email : null
    },

    jiraUsers() {
      return this.$store.getters.jira_users
    },

    newData() {
      return this.engineersStockGood.filter(item => item.type === 2 && item.request !== 3)
    },

    refData() {
      return this.engineersStockGood.filter(item => item.type === 1 && (item.request !== 3 && item.request !== 0))
    },

    missingData() {
      return this.engineersStockGood.filter(item => item.type === 0)
    },

    archiveOperations() {
      return this.engineersStockGood.filter(item => item.request === 3 || item.request === 0)
    },

    access() {
      const role = this.$store.getters.userRole
      const Arr = role.split('&')
      if (Arr.find(item => item === 'admin') || Arr.find(item => item === 'engineer')) {
        return true
      } else return false
    }

  },

  async mounted() {
    window.scrollTo(0, 0)

    this.loading = true
    if (this.$store.getters['market_new/market'].length === 0) await this.$store.dispatch('market_new/get')
    await this.loadActiveTabsFromLS()
    this.loading = false
  },

  methods: {

    handleClick() {
      this.saveActiveTabToLS(this.active)
    },

    prevQuorter() {
      const d = new Date()
      d.setDate(d.getDate() - 90)
      return d
    },

    showName(username) {
      const user = this.jiraUsers.find(user => user.user_name === username || user.email === username)
      return user
        ? user.display_name
        : username
    },

    getEmail(username) {
      if (username && this.jiraUsers.length > 0) {
        const user = this.jiraUsers.find(user => user.user_name === username)
        return user
          ? user.email
          : null
      }
    },

    saveActiveTabToLS(active) {
      localStorage.setItem('activeTabs', JSON.stringify({ engineersStock: active }))
    },

    loadActiveTabsFromLS() {
      const isTab = localStorage.getItem('activeTabs')
      isTab
        ? this.active = JSON.parse(isTab).engineersStock
        : this.active = 'workdesk'
    },

    async getModelList(id) {
      if (id) {
        if (id === this.modelList.id) {
          console.log('повтор')
          return this.modelList
        }
        await getModelList({ id })
          .then(res => {
            this.modelList = { id: id, data: res.Models.split(',').join(', ') }
          })
      }
    },

    async delItem(item) {
      item.eng = this.getEmail(item.eng)
      item.user = this.user
      console.log(item)
      if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'red' })) {
        this.$store.dispatch('deleteEngineersStock', item)
          .then(() => {
            this.$store.commit('setData', 'Данные успешно удалены.')
          })
      } else {
        this.$store.commit('setInfo', 'Удаление отменено.')
      }
    },

    async sendRequest(item) {
      if (await this.$refs.confirm.open('Отправка запроса', 'Вы уверены?', { color: 'orange' })) {
        let { request } = item
        const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        if (!request) request = 1
        this.$store.dispatch('sendRequest', { status: request, id: item.id, user: this.user, date: now, type: item.type, eng: this.getEmail(item.eng) })
          .then(() => {
            this.$store.commit('setData', 'Запрос отправлен!')
          })
      } else {
        this.$store.commit('setInfo', 'Запрос отменён.')
      }
    },

    async sendApprove(item) {
      if (await this.$refs.confirm.open('Подтверждение', 'Вы уверены?', { color: 'green' })) {
        const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        this.$store.dispatch('sendApprove', { id: item.id, user: this.user, date: now, type: item.type, eng: this.getEmail(item.eng) })
          .then(() => {
            this.$store.commit('setData', 'Подтверждаю')
          })
      } else {
        this.$store.commit('setInfo', 'Подтверждение отменёно')
      }
    },

    async sendDecline(item) {
      if (await this.$refs.confirm.open('Отклонение', 'Вы уверены?', { color: 'orange' })) {
        const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        this.$store.dispatch('sendDecline', { id: item.id, user: this.user, date: now, type: item.type, eng: this.getEmail(item.eng) })
          .then(() => {
            this.$store.commit('setData', 'Отклонено')
          })
      } else {
        this.$store.commit('setInfo', 'Отклонение отменёно')
      }
    },

    async sendCheck(item) {
      if (await this.$refs.confirm.open('Взять на проверку', 'Вы уверены?', { color: 'green' })) {
        const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        this.$store.dispatch('sendCheck', { id: item.id, user: this.user, date: now, type: item.type, eng: this.getEmail(item.eng) })
          .then(() => {
            this.$store.commit('setData', 'Передано на проверку')
          })
      } else {
        this.$store.commit('setInfo', 'Проверка отменёна')
      }
    },

    addZip(type) {
      this.$refs.addZip.open(type)
    },

    saveComment(id, comment) {
      if (comment) {
        this.$store.dispatch('saveComment', { id: id, comment: comment })
          .then(() => {
            this.$store.commit('setData', 'Комментарий успешно изменён (добавлен)')
          })
      } else {
        this.$store.commit('setError', 'Поле не заполнено!')
      }
    }

  }

}
</script>

<style lang="scss" scoped>
	.test {
		display: flex;
	}
</style>
