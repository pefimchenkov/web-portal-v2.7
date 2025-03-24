<template>
  <v-container v-loading="(ZipList.length === 0)" :fill-height="(ZipList.length === 0)" fluid>

    <ConfirmWithCount ref="confirm_with_count" @Count="addItemToBasket" />

    <v-dialog
      v-model="showForFilter"
      width="600"
      @click="showForFilter = false"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          {{ infoText }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogTechProps"
      width="1000"
    >
      <TechProps :key="editedItem.marketid" :market-item="editedItem" />
    </v-dialog>

    <!--  Создание именованного фильтра  -->

    <v-dialog v-model="showFilterName" width="500px">
      <v-card class="pa-3">
        <v-card-title class="headline">Введите название для фильтра</v-card-title>
        <v-card-text>
          <v-text-field v-model="filterName" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <el-button
            size="small"
            plain
            @click="showFilterName = false"
          >
            Отменить
          </el-button>
          <el-button
            size="small"
            plain
            @click="createFilter(filterName)"
          >
            Сохранить
          </el-button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================================ -->

    <v-dialog v-model="dialogImg" :max-width="imageWidth">
      <v-img v-if="selectedImage" width="100%" :src="selectedImage" @click.stop="closeImg()" />
    </v-dialog>

    <v-toolbar
      v-show="ZipList.length > 0"
      color="grey lighten-3"
      class="elevation-2 mb-1"
      dense
      :height="$vuetify.breakpoint.smAndDown ? `100` : ``"
    >

      <!-------------------- Открепить / Закрепить --------------->

      <v-checkbox
        v-model="checkBox"
        hide-details
        :label="checkBox ? 'Открепить' : 'Закрепить'"
        class="mr-10"
      />

      <!----------------------- КУРСЫ ВАЛЮТ ---------------------->

      <ExchangeRates />
      <v-spacer />

      <!-- ================= МЕНЮ ДЕЙСТВИЙ ==================== -->

      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button icon="el-icon-s-operation">
          Действия 123
        </el-button>

        <el-dropdown-menu slot="dropdown">

          <el-dropdown-item>
            <TableColumns :headers="visibleHeaders" name="marketColumn" />
          </el-dropdown-item>

          <el-dropdown-item v-if="$acl.check('Excel')">
            <el-dropdown trigger="click">
              <div>Экспорт в excel</div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <download-excel
                    :fields="getJsonFieldsAll"
                    :data="ZipList"
                    name="zip_prices.xls"
                  >Все значения
                  </download-excel>
                </el-dropdown-item>
                <el-dropdown-item>
                  <download-excel
                    :fields="json_fields"
                    :fetch="getExel"
                    name="zip_prices.xls"
                  >Текущий фильтр
                  </download-excel>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-dropdown-item>

        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button>
          <svg-icon icon-class="filter" />
          Фильтры
        </el-button>

        <el-dropdown-menu slot="dropdown">

          <el-dropdown-item>
            <v-menu
              v-model="menu_th"
              :close-on-content-click="false"
              :nudge-width="100"
              offset-x
            >
              <template #[`activator`]="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                  Технические характеристики
                </span>
              </template>

              <MarketFilter :types="AllTypes" @setTpFilter="setTpFilter" @resetTpFilter="resetTpFilter" @setType="setType" />

            </v-menu>
          </el-dropdown-item>

          <el-dropdown-item>
            <NamedFilters :filters="Filters" @load-filter="loadFilter" @reset-filter="resetFilter" @set-parent-filters="setParentFilters" />
          </el-dropdown-item>

          <el-dropdown-item>
            <p @click.stop="resetFilter">Сбросить фильт</p>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- -------  МАГАЗИН -------- -->

      <el-dropdown v-if="(Basket.length > 0 || Orders.length > 0)" trigger="click" :hide-on-click="false" @command="handleCommandOrders">
        <el-button icon="el-icon-s-cooperation">
          Заказы
        </el-button>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="Basket.length > 0" :hide-on-click="false" command="showBasket">
            <Basket
              :show="showBasket"
              @close="showBasket = false"
              @updateFromBasket="updateFromBasket"
            />
          </el-dropdown-item>

          <el-dropdown-item v-if="Orders.length > 0" :hide-on-click="true" command="showOrders">
            <Orders
              :show="showOrders"
              :update-from-basket="isUpdateFromBasket"
              @close="showOrders = false"
              @resetBasketUpdate="isUpdateFromBasket = false"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-----------------------------  Основной диалог для редактирования / добавления  =================================----->

      <v-dialog
        v-model="dialog"
        persistent
        width="1000"
        :disabled="$acl.not.check('Edit')"
        @keydown.esc="dialog = false"
      >

        <template #activator="{on}">
          <el-button type="primary" icon="el-icon-plus" size="small" :disabled="$acl.not.check('Edit')" v-on="$acl.not.check('Edit') ? '' : on" />
        </template>

        <el-card class="box-card">

          <h4 style="background: lightblue; line-height: 2em; margin-bottom: 5px; text-align: center">
            {{ formTitle }}
          </h4>

          <v-container grid-list-md text-center>
            <v-row justify="center" align="center">
              <v-col cols="12">
                <v-combobox
                  v-if="editedIndex === -1"
                  ref="element"
                  v-model="editedItem.elementTYPE"
                  :rules="ReqRules"
                  :items="['ЗИП', 'МОДЕЛЬ']"
                  label="Тип элемента *"
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="8">
                <v-text-field
                  ref="price"
                  v-model="editedItem.marketPRICE"
                  :value="editedItem.marketPRICE ? editedItem.marketPRICE : editedItem.marketPRICE = '0'"
                  :readonly="$acl.not.check('Admin')"
                  :label="$acl.not.check('Admin') ? 'Цена стоковая (права администратора)' : 'Цена стоковая'"
                  :disabled="$acl.not.check('Admin')"
                  :rules="priceRules"
                  required
                  validation
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="4">
                <v-combobox
                  ref="cur"
                  v-model="editedItem.CUR"
                  :value="editedItem.CUR ? editedItem.CUR : editedItem.CUR = '₽'"
                  :items="currency"
                  :readonly="$acl.not.check('Admin')"
                  :disabled="$acl.not.check('Admin')"
                  label="Валюта"
                  small-chips
                  required
                  validation
                  :rules="ReqRules"
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  ref="ratio"
                  v-model="editedItem.K1"
                  :value="editedItem.K1 || 1"
                  :readonly="$acl.not.check('Admin')"
                  :disabled="$acl.not.check('Admin')"
                  :label="$acl.not.check('Admin') ? 'Коэф. себестоимость (права администратора)' : 'Коэф. себестоимость'"
                  :rules="ratioRules"
                  required
                  validation
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  ref="ratio"
                  v-model="editedItem.K2"
                  :value="editedItem.K2 || 2.4"
                  :readonly="$acl.not.check('Admin')"
                  :disabled="$acl.not.check('Admin')"
                  :label="$acl.not.check('Admin') ? 'Коэф. продажа (права администратора)' : 'Коэф. продажа'"
                  :rules="ratioRules"
                  required
                  validation
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="stock" label="Себестоимость, руб." readonly disabled />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="site" label="Продажа, руб." readonly disabled />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="partner" label="Партнер, руб." readonly disabled />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="opt" label="Опт, руб." readonly disabled />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.marketPN"
                  label="Партномер"
                  hide-details
                />
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  ref="supp"
                  v-model="editedItem.marketSUPPLIER"
                  :items="suppliers"
                  label="* Производитель"
                  required
                  validation
                  :rules="ReqRules"
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.marketDESC" label="Описание ТХ" />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  ref="article"
                  v-model="editedItem.marketART"
                  label="1C Арт"
                  :rules="artRules"
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  ref="cond"
                  v-model="editedItem.marketCOND"
                  :items="conditions"
                  label="* Состояние"
                  required
                  validation
                  :rules="ReqRules"
                  regular
                  hide-details
                />
              </v-col>
              <v-col v-if="editedItem.elementTYPE === 'ЗИП' || editedItem.elementTYPE === 1 " cols="12">
                <v-combobox
                  ref="objZIP"
                  v-model="editedItem.ZIP"
                  :items="Zip"
                  :item-text="namePlusArt"
                  item-value="ID"
                  label="* ЗИП"
                  :rules="ObjRules"
                  required
                  validation
                  return-object
                  regular
                  hide-details
                />
              </v-col>
              <v-col v-if="editedItem.elementTYPE === 'МОДЕЛЬ' || editedItem.elementTYPE === 2" cols="12">
                <v-autocomplete
                  ref="objMODELS"
                  v-model="editedItem.MODELS"
                  :items="Models"
                  :item-text="namePlusModel"
                  label="* МОДЕЛЬ"
                  :rules="ObjRules"
                  required
                  validation
                  return-object
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-combobox
                  v-if="editedIndex === -1"
                  v-model="Parts"
                  :items="editedItem.MODELS && editedItem.MODELS.ID ? ModelMarketList : ZipList"
                  :item-text="idNameTypeArtPNModels"
                  label="СОСТАВ"
                  :search-input.sync="search"
                  multiple
                  small-chips
                  deletable-chips
                  clearable
                  hide-selected
                  return-object
                  :allow-overflow="true"
                  class="font-weight-medium"
                  hide-details
                >
                  <template #no-data>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          Результат поиска "<strong>{{ search }}</strong>" отсутствует. Пожалуйста, вводите правильные данные!
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                  <template #selection="{ item, parent}">
                    <v-chip
                      color="blue lighten-4"
                      label
                      small
                    >
                      {{ idNameTypeArtPNModels(item) }}
                    </v-chip>
                    <v-icon
                      small
                      @click="parent.selectItem(item)"
                    >close</v-icon>
                  </template>
                </v-combobox>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  ref="pack"
                  v-model="editedItem.marketPack"
                  label="Кол-во в упаковке"
                  :rules="packRules"
                  clearable
                  validation
                  regular
                  hide-details
                />
              </v-col>
              <v-col cols="5" style="margin: auto">
                <el-switch
                  v-model="editedItem.marketSITE"
                  :active-value="1"
                  :inactive-value="0"
                  :readonly="$acl.not.check('Admin')"
                  :inactive-text="$acl.not.check('Admin') ? 'Разместить на сайте (нужны права администратора)' : 'Разместить на сайте'"
                  :active-text="$acl.not.check('Admin') ? 'Убрать с сайта (права администратора)' : 'Убрать с сайта '"
                  :disabled="$acl.not.check('Admin')"
                />
              </v-col>

              <v-col cols="12" class="text-center">
                <el-button
                  type="warning"
                  plain
                  class="mr-3"
                  :disabled="localLoading"
                  @click.native="dialog = false"
                >Отмена
                </el-button>
                <el-button
                  type="success"
                  plain
                  :disabled="localLoading"
                  :loading="localLoading"
                  @click.native="save"
                >Сохранить
                </el-button>
              </v-col>

            </v-row>
          </v-container>
        </el-card>
      </v-dialog>

    </v-toolbar>
    <v-spacer />

    <h4 v-if="activeFilterName" class="text-lg-center mb-2">Применён фильтр - <span class="info--text">{{ activeFilterName }} </span> </h4>

    <v-container v-loading="loading" class="ma-0 pa-0" fluid>

      <v-data-table
        ref="marketTable"
        :headers="computedHeaders"
        :items="ZipList"
        :fixed-header="checkBox"
        :height="checkBox ? WindowHeight : null"
        dense
        calculate-widths
        item-key="marketid"
        :mobile-breakpoint="750"
        sort-by="marketid"
        sort-desc
        class="elevation-2"
        :footer-props="{
          itemsPerPageText: 'Строк на странице',
          itemsPerPageOptions: [25,100,250],
          showFirstLastPage: true
        }"
      >

        <!-- ------------------------Строка горизонтальных фильров --------------------- -->

        <template v-if="mobileView" #[`body.prepend`]>
          <tr>
            <td
              v-for="header in computedHeaders"
              :key="header.marketid"
              class="py-2"
            >
              <v-switch
                v-if="header.value === 'marketPHOTO'"
                v-model="filters.searchMarketPhoto"
                @change="fillColumnPhoto"
              />
              <v-text-field
                v-if="header.value === 'marketid'"
                v-model="filters.searchMarketID"
              />
              <v-text-field
                v-if="header.value === 'marketID'"
                v-model="filters.searchMarketZipID"
              />
              <v-select
                v-if="header.value === 'elementTYPE'"
                v-model="filters.searchMarketElementTYPE"
                :items="['ЗИП', 'Модель', 'Не определён']"
                clearable
              />
              <v-select
                v-if="header.value === 'marketPARTS'"
                v-model="filters.searchMarketParts"
                :items="['c подтверждением', 'без подтверждения', 'нет']"
                clearable
                multiple
              />
              <v-autocomplete
                v-if="header.value === 'marketTYPE'"
                v-model="filters.searchMarketType"
                :items="AllTypes"
                item-text="name"
                autocomplete
                clearable
                hide-details
                class="pb-5"
              />
              <v-text-field
                v-if="header.value === 'marketNAME'"
                v-model="filters.searchMarketName"
                clearable
                type="text"
              />
              <v-switch
                v-if="header.value === 'marketTH'"
                v-model="filters.activateTH"
              />
              <v-autocomplete
                v-if="header.value === 'marketMODELS'"
                v-model="filters.searchMarketModel"
                :items="Models"
                multiple
                item-text="MODEL"
                clearable
                chips
                deletable-chips
                hide-details
                class="pb-5"
              />
              <v-text-field
                v-if="header.value === 'marketPN'"
                v-model="filters.searchMarketPN"
                clearable
                type="text"
              />
              <v-autocomplete
                v-if="header.value === 'marketSUPPLIER'"
                v-model="filters.searchMarketSupp"
                multiple
                :items="marketSupp"
                deletable-chips
                clearable
                chips
              />
              <v-autocomplete
                v-if="header.value === 'marketCOND'"
                v-model="filters.searchMarketCond"
                multiple
                :items="marketCond"
                deletable-chips
                clearable
                chips
              />
              <v-text-field
                v-if="header.value === 'marketART'"
                v-model="filters.searchMarketART"
                type="text"
              />
              <v-text-field
                v-if="header.value === 'marketEMAIL'"
                v-model="filters.searchMarketEmail"
                clearable
                type="text"
              />
              <template v-if="header.value === 'marketDATE'">
                <v-menu
                  ref="menuMarketDate"
                  v-model="menuMarketDate"
                  :close-on-content-click="false"
                  transition="scale-transition"
                >
                  <template #activator="{ on }">
                    <v-icon :color="filters.searchMarketDate !== null && filters.searchMarketDate.length > 0 ? `green darken-2` : ``" v-on="on">event</v-icon>
                  </template>
                  <v-date-picker v-model="filters.searchMarketDate" multiple no-title>
                    <div class="flex-grow-1" />
                    <v-btn text color="primary" @click="menuMarketDate = false">Отмена</v-btn>
                    <v-btn text color="primary" @click="$refs.menuMarketDate[0].save(filters.searchMarketDate)">OK</v-btn>
                  </v-date-picker>
                </v-menu>
                <v-icon v-if="filters.searchMarketDate !== null && filters.searchMarketDate.length > 0" @click="filters.searchMarketDate = []">clear</v-icon>
              </template>

              <v-switch
                v-if="header.value === 'marketSITE'"
                v-model="filters.searchMarketSite"
                :value="filters.searchMarketSite"
              />

            </td>
          </tr>
        </template>

        <!-- ---------------------- Преобразованные данные ------------------------ -->

        <template #[`item.marketPHOTO`]="{ item }">
          <img
            v-if="loadPhoto(item)"
            v-lazyload
            :data-src="loadPhoto(item)"
            :style="`max-width:100px`"
            class="xlsx_btn"
            @click="zoom($event, loadPhoto(item))"
          >
        </template>

        <template #[`item.marketPARTS`]="{ item }">

          <span>{{ item.marketPARTS }}</span>
          <v-icon v-if="item.marketPARTS > 0 && item.Approved === 1" color="success" class="ml-1">
            mdi-check-decagram
          </v-icon>
          <v-icon v-if="item.marketPARTS > 0 && item.Approved === 2" color="#ccc" class="ml-1">
            mdi-check-decagram
          </v-icon>

        </template>

        <template #[`item.marketid`]="{ item }">
          <td :style="`background-color:${ratingColor(item.marketRating)}; border-radius: 5px; color: ${item.marketRating === 1 || item.marketRating === 5 ? '#fff' : '#000'}`" class="px-2 py-1">{{ item.marketid }}</td>
        </template>

        <template #[`item.marketID`]="{ item }">
          <v-icon v-if="item.elementTYPE === 1 && item.marketPARTS === 0" class="mr-1">memory</v-icon>

          <v-icon v-if="item.elementTYPE === 1 && item.marketPARTS > 0" class="mr-1">mdi-cogs</v-icon>

          <v-icon v-if="item.elementTYPE === 2 && item.marketPARTS === 0" class="mr-1">phone_android</v-icon>

          <v-icon v-if="item.elementTYPE === 2 && item.marketPARTS > 0" class="mr-1">phonelink_setup</v-icon>

          <span v-if="item.elementTYPE === 1 && item.marketINPARTS === 1" class="font-weight-black xlsx_btn" @click="gotoMainZip(item.marketID)"> ( {{ item.marketID }} )</span>
          <span v-else-if="item.elementTYPE === 1 && item.marketINPARTS === 0" class="xlsx_btn" @click="gotoMainZip(item.marketID)">{{ item.marketID }}</span>
          <span v-if="item.elementTYPE === 2" class="xlsx_btn" @click="gotoMainModels(item.marketID)">{{ item.marketID }}</span>

        </template>

        <template #[`item.elementTYPE`]="{ item }">
          {{ transformElementType(item.elementTYPE) }}
        </template>

        <template #[`item.marketTH`]="{ }">
          {{ filters.searchMarketTH.length > 0 ? filters.searchMarketTH.map(i => i.name).join(', ') : '' }}
        </template>

        <template #[`item.marketpriceSTOCK`]="{ item }">
          {{ item.priceSTOCK }}
          <v-icon v-if="item.priceSTOCK" color="blue" small>mdi-currency-rub</v-icon>
        </template>
        <template #[`item.marketpriceSITE`]="{ item }">
          {{ item.priceCLIENT }}
          <v-icon v-if="item.priceCLIENT" color="blue" small>mdi-currency-rub</v-icon>
        </template>
        <template #[`item.marketpricePART`]="{ item }">
          {{ item.pricePART }}
          <v-icon v-if="item.pricePART" color="blue" small>mdi-currency-rub</v-icon>
        </template>
        <template #[`item.marketpriceOPT`]="{ item }">
          {{ item.priceOPT }}
          <v-icon v-if="item.priceOPT" color="blue" small>mdi-currency-rub</v-icon>
        </template>
        <template #[`item.marketPRICE`]="{ item }">
          {{ item.marketPRICE }}
          <v-icon v-if="item.CUR === '€'" color="warning" small>mdi-currency-eur</v-icon>
          <v-icon v-if="item.CUR === '$'" color="success" small>mdi-currency-usd</v-icon>
          <v-icon v-if="item.CUR === '₽'" color="blue" small>mdi-currency-rub</v-icon>
        </template>

        <template #[`item.sebT`]="{ item }">
          <span :style="`${(((+item.priceSTOCK / +item.sebT) > 1.1) || ((1 - (+item.priceSTOCK / +item.sebT )) > 0.1)) && (item.priceSTOCK && item.sebT) ? 'color: red' : ''}`">
            {{ item.sebT }}
          </span>
        </template>

        <template #[`item.sebA`]="{ item }">
          <span :style="`${(((+item.priceSTOCK / +item.sebA) > 1.1) || ((1 - (+item.priceSTOCK / +item.sebA )) > 0.1)) && (item.priceSTOCK && item.sebA) ? 'color: red' : ''}`">
            {{ item.sebA }}
          </span>
        </template>

        <template #[`item.marketDATE`]="{ item }">
          {{ new Date(item.marketDATE).toLocaleDateString('ru') }}
        </template>

        <template #[`item.marketEMAIL`]="{ item }">
          {{ item.marketEMAIL | getUserName }}
        </template>

        <template #[`item.marketSITE`]="{ item }">
          <v-icon v-if="item.marketSITE === 1">mdi-web</v-icon>
        </template>

        <template #[`item.marketSKLAD`]="{ item }">
          <v-tooltip top>
            <template #activator="{on}">
              <span v-on="on">{{ item.marketSKLAD }}</span>
            </template>
            <span>{{ 'Дата обновления -' + new Date(item.skladDATE).toLocaleDateString('ru-Ru', { hour: 'numeric', minute: 'numeric' }) }}</span>
          </v-tooltip>
        </template>

        <!--     Меню действий    -->

        <template #[`item.action`]="{ item }">
          <v-menu
            bottom
            left
          >
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-if="$acl.check('Edit')" small class="mr-2" @click="editItem(item)">Редактировать</v-list-item>
              <v-list-item v-if="$acl.check('Delete')" small @click="deleteItem(item)">Удалить</v-list-item>
              <v-list-item v-if="$acl.check('BasketAccess') || $acl.check('Agent')" small @click="itemToBasket(item)">Добавить в заказ</v-list-item>
              <v-list-item v-if="$acl.check('Edit')" small @click="editTechProps(item)">Технические характеристики</v-list-item>
              <v-list-item v-if="$acl.check('Edit') || $acl.check('LeadEngineer') || $acl.check('Financier') || $acl.check('Agent')" text fab small left :to="'/market/' + item.marketid">Подробнее</v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- .................... -->

      </v-data-table>
    </v-container>
  </v-container>
</template>

<script>
import Api from '@/services/Api'
import { mapGetters, mapState } from 'vuex'

import ExchangeRates from './components/exchange-rates'
import Basket from './components/basket.vue'
import Orders from './components/orders.vue'
import TechProps from './components/tech-props.vue'
import MarketFilter from './components/market-filter'
import ConfirmWithCount from '@/components/shared/ConfirmWithCount.vue'

import moment from 'moment'
import _ from 'lodash'
import GetConfig from '@/services/GetConfig'
import { createTechProps } from '@/helpers/market/tech-props-filter'
import { getUserName } from '@/filters/jira-users'
import { add, update, remove, checkInRemonts } from '@/api/market'
import { AclRule } from 'vue-acl'

import TableColumns from '@/components/DataTable/columns.vue'
import NamedFilters from '@/components/shared/NamedFilters.vue'

export default {

  components: {
    Basket,
    Orders,
    TechProps,
    ExchangeRates,
    MarketFilter,
    ConfirmWithCount,
    TableColumns,
    NamedFilters
  },

  filters: {

    getUserName

  },

  data() {
    return {
      menuMarketDate: false,
      loading: false,

      filters: {
        searchMarketID: null,
        searchMarketZipID: null,
        searchMarketElementTYPE: null,
        searchMarketType: null,
        searchMarketName: null,
        searchMarketModel: [],
        searchMarketPN: null,
        searchMarketCond: [],
        searchMarketSupp: [],
        searchMarketART: null,
        searchMarketEmail: null,
        searchMarketDate: [],
        searchMarketSite: false,
        searchMarketParts: [],
        searchMarketElement: null,
        searchMarketTH: [],
        activateTH: false
      },

      multiSelects: {
        marketSupp: [],
        marketCond: []
      },

      infoText: '',
      screenSize: 80,
      maxWidth: '100px',
      filterText: 'Нажмите для активации фильтра',

      ZipList: [],
      ModelMarketList: [],
      AllTypes: [],
      Parts: [],
      Filters: [],
      CurrentOrder: [],
      TechProperties: [],
      WindowHeight: null,

      search: '',
      selectedImage: null,
      imageWidth: '',
      filtered: '',
      showOrders: false,
      showBasket: false,
      isUpdateFromBasket: false,
      showForFilter: false,
      activeFilterName: '',
      active: 'tab-1',
      toggle: false,
      checkBox: true,
      curs: 1,

      dialog: false,
      dialogImg: false,
      dialogTechProps: false,

      filterName: '',
      showFilterName: false,
      switchFilter: false,
      menu: false,
      menu_filter: false,
      menu_th: false,
      filterTitle: 'Правка цен',
      localLoading: false,

      ART_1C: '',

      headers: [
        { text: 'Фото',
          value: 'marketPHOTO',
          selected: localStorage.marketPHOTO,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketPhoto) return true
            return value === this.filters.searchMarketPhoto
          }
        },
        { text: 'Маркет ID',
          value: 'marketid',
          selected: localStorage.marketid,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketID) return true
            return value === +this.filters.searchMarketID
          }
        },
        { text: 'ID Элемента',
          value: 'marketID',
          selected: localStorage.marketID,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketZipID) return true
            return value === +this.filters.searchMarketZipID
          }
        },
        { text: 'Тип Элемента',
          value: 'elementTYPE',
          selected: localStorage.elementTYPE,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketElementTYPE) return true
            if (this.filters.searchMarketElementTYPE === 'ЗИП') return value === 1
            if (this.filters.searchMarketElementTYPE === 'Модель') return value === 2
            if (this.filters.searchMarketElementTYPE === 'Не определён') return !value
          }
        },
        { text: 'Состав',
          value: 'marketPARTS',
          selected: localStorage.marketPARTS,
          visible: true,
          divider: true,
          align: 'left',
          filter: (value, search = null, item) => {
            if (!this.filters.searchMarketParts || !this.filters.searchMarketParts.length) return true

            if (this.filters.searchMarketParts[0] === 'c подтверждением' && this.filters.searchMarketParts.length === 1) return (value > 0 && item.Approved === 1)
            if (this.filters.searchMarketParts[0] === 'без подтверждения' && this.filters.searchMarketParts.length === 1) return (value > 0 && item.Approved !== 1)
            if (this.filters.searchMarketParts[0] === 'нет' && this.filters.searchMarketParts.length === 1) return (value === 0)
            if (['без подтверждения', 'c подтверждением'].includes(this.filters.searchMarketParts.find(i => i)) && this.filters.searchMarketParts.length > 1) return (value > 0)
          }
        },
        { text: 'Тип',
          value: 'marketTYPE',
          selected: localStorage.marketTYPE,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketType) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.searchMarketType.toLowerCase())
          }
        },
        { text: 'Название',
          value: 'marketNAME',
          selected: localStorage.marketNAME,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketName) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.searchMarketName.toLowerCase())
          }
        },
        { text: 'Описание',
          value: 'marketDESC',
          selected: localStorage.marketDESC,
          visible: true,
          divider: true
        },
        { text: 'ТХ',
          value: 'marketTH',
          selected: localStorage.marketTH,
          visible: true,
          divider: true,
          filter: value => {
            if (!value) return true
            if (this.filters.activateTH) {
              return value.length > 0
            }
            return this.filters.searchMarketTH.length > 0
              ? this.filters.searchMarketTH.every(item => item.find(i => value.includes(i.id)))
              : true
          }
        },
        { text: 'Модели',
          value: 'marketMODELS',
          selected: localStorage.marketMODELS,
          visible: true,
          divider: true,
          width: 190,
          filter: value => {
            if (!value) return true
            return this.filters.searchMarketModel.length === 0
              ? true
              : value.split(', ').includes(this.filters.searchMarketModel.find(item => value.includes(item)))
          }
        },
        { text: 'PN',
          value: 'marketPN',
          selected: localStorage.marketPN,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketPN) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.searchMarketPN.toLowerCase())
          }
        },
        { text: 'Производитель',
          value: 'marketSUPPLIER',
          selected: localStorage.marketSUPPLIER && this.$acl.not.check('OnlyAgent'),
          visible: this.$acl.not.check('OnlyAgent'),
          divider: true,
          filter: value => {
            if (this.filters.searchMarketSupp.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.searchMarketSupp.find(item => item === value))
          }
        },
        { text: 'Сост',
          value: 'marketCOND',
          selected: localStorage.marketCOND,
          visible: true,
          divider: true,
          filter: value => {
            if (this.filters.searchMarketCond.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.searchMarketCond.find(item => item === value))
          }
        },
        { text: 'Артикул ТСД',
          value: 'marketART',
          selected: localStorage.marketART,
          visible: true,
          width: 110,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketART) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.searchMarketART.toLowerCase())
          }
        },
        { text: 'Кол-во',
          value: 'marketPack',
          selected: localStorage.marketPack,
          visible: true,
          divider: true
        },
        { text: 'Стоковая',
          value: 'marketPRICE',
          selected: localStorage.marketPRICE && this.$acl.check('Financier'),
          visible: this.$acl.check('Financier') || this.$acl.check('LeadEngineer'),
          divider: true
        },
        { text: 'Себес (₽)',
          value: 'priceSTOCK',
          selected: localStorage.marketpriceSTOCK && this.$acl.check('Manager'),
          visible: this.$acl.check('Manager'),
          divider: true
        },
        { text: 'Себ 1cТ',
          value: 'sebT',
          selected: localStorage.marketpriceSTOCK && this.$acl.check('Manager'),
          visible: this.$acl.check('Manager'),
          divider: true
        },
        { text: 'Себ 1cA',
          value: 'sebA',
          selected: localStorage.marketpriceSTOCK && this.$acl.check('Manager'),
          visible: this.$acl.check('Manager'),
          divider: true
        },
        { text: 'Прод (₽)',
          value: 'priceCLIENT',
          selected: localStorage.marketpriceCLIENT,
          visible: true,
          divider: true },
        { text: 'Партнёр (₽)',
          value: 'pricePART',
          selected: localStorage.marketpricePART,
          visible: true,
          divider: true },
        { text: 'Опт (₽)',
          value: 'priceOPT',
          selected: localStorage.marketpriceOPT,
          visible: true,
          divider: true },
        { text: 'Склад ТСД',
          value: 'marketSKLAD',
          selected: localStorage.marketSKLAD,
          visible: true,
          divider: true },
        { text: 'Склад Атлас',
          value: 'marketATLAS',
          selected: localStorage.marketART_AP,
          visible: true,
          divider: true },
        { text: 'Заказ',
          value: 'marketZAKAZ',
          selected: localStorage.marketZAKAZ,
          visible: true,
          divider: true },
        { text: 'Склад ABS',
          value: 'marketABS',
          selected: localStorage.marketART_ABS,
          visible: true,
          divider: true },
        { text: 'Склад ИМ',
          value: 'marketBEIJING',
          selected: localStorage.marketART_AP,
          visible: true,
          divider: true },
        { text: 'Авт',
          value: 'marketEMAIL',
          selected: localStorage.marketEMAIL,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketEmail) return true
            if (!value) return false
            return getUserName(value).toLowerCase().includes(this.filters.searchMarketEmail.toLowerCase())
          }
        },
        { text: 'Изменен',
          value: 'marketDATE',
          selected: localStorage.marketDATE,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.searchMarketDate || this.filters.searchMarketDate.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const Arr = this.filters.searchMarketDate.map(item => moment(item).unix())
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            return (moment(value).unix() >= first && moment(value).unix() <= last)
          }
        },
        { text: 'Сайт',
          value: 'marketSITE',
          selected: localStorage.marketSITE,
          visible: true,
          divider: true,
          filter: value => {
            value === 1 ? value = true : value = false
            if (this.filters.searchMarketSite === 'false' || this.filters.searchMarketSite === 'null') {
              this.filters.searchMarketSite = false
            }
            if (this.filters.searchMarketSite === 'true') {
              this.filters.searchMarketSite = true
            }
            if (!this.filters.searchMarketSite) return true
            return value === this.filters.searchMarketSite
          }
        },
        { text: 'Действия',
          value: 'action',
          sortable: false,
          align: 'center',
          selected: localStorage.marketEDIT,
          visible: true,
          divider: true
        }
      ],
      editedIndex: -1,
      marketTitle: '',

      editedItem: {

        K1: 1,
        K2: 2.4,
        marketPRICE: 0,
        marketSITE: false,
        marketPack: 1,
        CUR: null

      },

      defaultItem: {

        K1: 1,
        K2: 2.4,
        marketPRICE: 0,
        marketSITE: false,
        marketPack: 1

      },

      priceRules: [
        v => !!v || 'Стоковая цена - обязательный параметр!',
        v => /^[0-9.]+$/.test(v) || 'Допускаются только цифры!'
      ],
      ratioRules: [
        v => !!v || 'Коэффициент - обязательный параметр!',
        v =>
          /^[0-9.]+$/.test(v) ||
					'Допускаются только цифры и точка для дробной части!)'
      ],
      allArtRules: [
        v => !!v || 'Артикул - обязательный параметр!',
        v =>
          /^[а-яА-ЯёЁa-zA-Z0-9]+$/.test(v) ||
					'Допускаются только цифры и буквы (латиница и кириллица)!'
      ],
      artRules: [
        function(v) {
          if (v === undefined || v === '' || v === null) {
            return true
          } else {
            return /^[ТП0-9.]{8,8}$/.test(v) || 'Правильно: Буква ` Т ` кириллицей и 7 цифр!'
          }
        },
        v => this.checkART(v) || 'Такой артикул уже присутствует в БД!'
      ],
      ReqRules: [
        v => !!v || 'Обязательный параметр!'
      ],
      ObjRules: [
        v => !!v || 'Обязательный параметр!',
        function(v) {
          if (typeof v === 'object') return true
          else return 'Не верный формат ввода!'
        }
      ],
      packRules: [
        function(v) {
          if (v === undefined || v === '' || v === null) {
            return true
          } else {
            return /^[0-9]+$/.test(v) || 'Допускаются только числа!'
          }
        }
      ],
      json_fields: {},
      json_fields_all: {},
      json_meta: [
        [
          {
            key: 'charset',
            value: 'utf-8'
          }
        ]
      ]
    }
  },

  computed: {
    // ...mapGetters(['market/market', 'dollar', 'euro']),
    ...mapGetters({ market: 'market_new/market', JiraUsers: 'jira_users', dollar: 'dollar', euro: 'euro' }),

    ...mapState({
      Zip: state => state.zip.Zip,
      Models: state => state.models.models,
      ModelsType: state => state.models.types,
      ProductsType: state => state.products_type.ProductsType,
      conditions: state => state.conditions.Conditions.map(item => item.name_ru),
      suppliers: state => state.suppliers.Suppliers.map(item => item.name),
      currency: state => state.currency.Currency.map(item => item.sign),
      Orders: state => state.market.Orders,
      Basket: state => state.market.Basket,
      MarketImg: state => state.marketImg.MarketImg
    }),

    mobileView() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return false
        case 'sm': return false
        default: return true
      }
    },

    getJsonFieldsAll() {
      const obj = {}
      this.headers.forEach(item => {
        obj[item.text] = item.value
      })
      return obj
    },

    computedHeaders() {
      return this.headers.filter(header => header.selected)
    },

    visibleHeaders() {
      return this.headers.filter(header => header.visible)
    },

    loadings() {
      return this.$store.getters.loadings
    },

    formTitle() {
      return this.editedIndex === -1 ? 'Добавление новых цен' : `Редакция Маркета c id ${this.editedItem.marketid} для ${this.marketTitle}`
    },

    stock() { // себестоимость
      return Math.round(this.editedItem.K1 * this.editedItem.marketPRICE * this.curs)
    },

    site() { // продажная
      return Math.round(this.editedItem.K2 * this.editedItem.marketPRICE * this.curs)
    },

    partner() { // партнёрская
      return Math.round(this.editedItem.K2 * this.editedItem.marketPRICE * this.curs * 0.9)
    },

    opt() { // оптовая
      return Math.round(this.editedItem.K2 * this.editedItem.marketPRICE * this.curs * 0.8)
    },

    BasketAccess() {
      return new AclRule('admin').or('nom').or('basket').generate()
    },

    Edit() {
      return new AclRule('admin').or('nom').generate()
    },

    Delete() {
      return new AclRule('admin').or('nom').generate()
    },

    Excel() {
      return new AclRule('admin').or('crm').generate()
    },

    userRole() {
      return this.$store.getters.userRole || 'user'
    },

    marketSupp() {
      return _.uniq(this.multiSelects.marketSupp)
    },
    marketCond() {
      return _.uniq(this.multiSelects.marketCond)
    }
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogImg(val) {
      val || this.closeImg()
    },
    Parts(val) {
      val.forEach(obj => {
        if (typeof obj !== 'object') {
          this.$nextTick(() => val.pop())
        }
      })
    },
    'editedItem.MODELS': {
      deep: true,
      handler(val) {
        if (val) {
          if (Object.keys(val).length > 0) {
            this.getModelMarketList(+val.ID)
          }
        }
      }
    },
    'editedItem.elementTYPE': {
      deep: true,
      handler(val) {
        if (val === 'ЗИП' || val === 1) {
          this.editedItem.MODELS = {}
        }
      }
    },
    'editedItem.CUR': {
      deep: true,
      handler(val) {
        if (val === '€') this.curs = this.euro
        if (val === '$') this.curs = this.dollar
        if (val === '₽') this.curs = 1
      }
    }
  },

  beforeMount() {
    this.WindowHeight = window.innerHeight - 210
  },

  async mounted() {
    const obj = {}

    for (const key in this.filters) {
      this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
        if (newVal === null) newVal = ''

        if (key === 'searchMarketTH') obj[key] = [...new Set(newVal)]
        else obj[key] = newVal

        localStorage.setItem('filtersMarket', JSON.stringify(obj))
      })
    }

    if (localStorage.filtersMarket) {
      var ls = JSON.parse(localStorage.filtersMarket)
      if (ls) {
        Object.keys(this.filters).forEach(key => {
          Object.entries(ls).forEach((item) => {
            if (JSON.parse(localStorage.getItem('filtersMarket'))[item[0]] && JSON.parse(localStorage.getItem('filtersMarket'))[item[0]] !== 'null' && item[0] === key) {
              this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersMarket'))[item[0]]
            }
          })
        })
      }
    }

    this.TechProperties = await createTechProps()

    window.addEventListener('resize', this.getWindowHeight)
  },

  async created() {
    console.time('Компонент создавался: ')

    await this.$store.dispatch('getCurrency')
    await this.$store.dispatch('getRatefromCB')

    await this.$store.dispatch('market_new/get')

    if (!this.Zip.length) await this.$store.dispatch('fetchZip')
    if (!this.Models.length) await this.$store.dispatch('models/models')
    if (!this.ProductsType.length) await this.$store.dispatch('fetchProductsType')
    if (!this.suppliers.length) await this.$store.dispatch('fetchSuppliers')
    if (!this.conditions.length) await this.$store.dispatch('fetchConditions')
    if (!this.Basket.length) await this.$store.dispatch('getBasket')
    if (!this.Orders.length) await this.$store.dispatch('getOrders')
    if (!this.MarketImg.length) await this.$store.dispatch('getMarketImg')
    await this.$store.dispatch('models/types')
    await this.$store.dispatch('fetchParts')

    if (this.ZipList.length === 0) await this.getData()

    this.AllTypes = [...this.ModelsType.map(i => ({ ...i, element: 2 })), ...this.ProductsType.map(i => ({ ...i, element: 1 }))]
    await this.init()

    /* =========================== чтение конфига =============================== */

    await GetConfig.getColumn('marketColumn')
      .then((data) => {
        if (data) {
          this.headers.forEach(header => {
            if (header.visible === false) return
            for (var key in data) {
              if (key === header.value) {
                header.selected = data[key]
              }
            }
          })
          console.log('Данные о сохранеённых колонках успешно загружены: ')
        }
      })
      .catch(error => {
        this.showForFilter = true
        this.infoText = error.message
      })

    await GetConfig.getMyFilters(this.$route.query.userID, this.$route.query.filterName, this.$route.query.payload)
      .then((filters) => {
        if (filters === undefined) return false
        if (filters['Маркет'] !== undefined) {
          Object.entries(filters['Маркет']).forEach(filter => {
            this.Filters.push({ name: filter[0], payload: filter[1] })
            if (this.$route.query.market === filter[0]) {
              return this.loadFilter(filter[0])
            }
          })
        }
        if (this.$route.query.userID && this.$route.query.filterName && this.$route.query.payload) {
          const existence = Object.keys(filters).filter((key, value) => key === this.$route.query.userID)
          this.showForFilter = true
          this.infoText = 'Ждите, идёт загрузка фильтра'
          let arr = []
          if (existence.length > 0) {
            arr = filters[existence]
          } else {
            arr = filters
          }
          arr.forEach(el => {
            if (typeof el === 'object') {
              this.filters = Object.assign(this.filters, el.Data)
            }
          })
          this.activeFilterName = `пользователь: " ` + this.$route.query.userID + ` ", название: " ` + this.$route.query.filterName + ` "`
          setTimeout(() => {
            this.showForFilter = false
          }, 2000)
        }
      })
      .catch(error => {
        console.log(error)
      })

    console.timeEnd('Компонент создавался: ')
  },

  // -------------------------- МЕТОДЫ -------------------------- //

  methods: {

    fillColumnPhoto() {
      console.time('getImages')

      if (this.filters.searchMarketPhoto) {
        this.MarketImg.map(img => +img.id).sort().forEach(el => {
          const obj = this.ZipList.find(zip => zip.marketid === el)
          if (obj) obj.marketPHOTO = true
        })
      }

      console.timeEnd('getImages')
    },

    async getModelMarketList(modelID) {
      await Api()
        .post('market/get_parts', [modelID])
        .then(res => {
          res.data.success === false ? this.ModelMarketList = this.ZipList : this.ModelMarketList = res.data
        })
        .catch(error => {
          if (error) throw error
        })
    },

    async getFutureMarketId() {
      await Api()
        .get('zip_prices/get_future_market_id')
        .then(res => {
          const count = String(res.data.lastItemId[0].ID + 1).length
          const countZero = 7 - count
          let Preffix = 'П'
          for (let i = 1; i <= countZero; i++) {
            Preffix += '0'
          }
          this.editedItem.marketART = Preffix + (res.data.lastItemId[0].ID + 1)
        })
    },

    changeWidth() {
      this.maxWidth === '' ? this.maxWidth = '100px' : this.maxWidth = ''
      localStorage.setItem('sizeColName', this.maxWidth)
    },

    async getExel() {
      const filtered = this.headers.filter(header => header.selected === true)
      filtered.forEach(item => {
        this.json_fields[item.text] = item.value
        if (item.text === 'Стоковая') {
          this.json_fields['Валюта'] = 'CUR'
        }
      })
      return this.$refs.marketTable.$children[0].filteredItems
    },

    transformElementType(number) {
      if (number === 1) return 'ЗИП'
      if (number === 2) return 'Модель'
      if (!number) return 'Не определён'
    },

    loadPhoto(item) {
      const img = this.MarketImg.find(img => +img.id === +item.marketid)
      return img ? img.url : false
    },

    zoom(e, url) {
      e.preventDefault()
      this.openImg()
      this.selectedImage = url
      this.MarketImg.forEach(photo => {
        if (photo.url === url) {
          this.imageWidth = parseInt(photo.width)
        }
      })
    },

    openImg() {
      this.dialogImg = true
      this.localLoading = true
    },
    closeImg() {
      this.dialogImg = false
      this.localLoading = false
      this.selectedImage = null
    },

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 210
    },

    getParts() {
      this.Parts = this.$store.getters.Parts
    },

    checkART(article) {
      if (this.ART_1C === article) {
        return true
      }
      if (article && article.length === 8) {
        if (this.ZipList.find(z => z.ART === article)) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },

    // ============================= Фильтры ============================= //

    async createFilter(name) {
      this.showFilterName = false
      const marketColumn = {}
      const id = 'Маркет'
      await this.headers.forEach(header => {
        header.selected === null ? marketColumn[header.value] = false : marketColumn[header.value] = header.selected
      })
      await this.$store.dispatch('createFilter', [name, id, { Data: this.filters, Columns: marketColumn }])
        .then(() => {
          this.Filters.push({ name: name, payload: { Data: this.filters, Columns: marketColumn }})
          this.$store.dispatch('setData', 'Фильтр успешно создан.')
        })
    },

    loadFilter(name) {
      this.Filters.forEach(filter => {
        if (filter.name.toString() === name) {
          for (const item in this.filters) {
            if (Array.isArray(this.filters[item])) this.filters[item].push(filter.payload.Data[item])
            else this.filters[item] = filter.payload.Data[item]
          }

          this.headers.forEach(header => {
            for (var key in filter.payload.Columns) {
              if (key === header.value) {
                header.selected = filter.payload.Columns[key]
              }
            }
          })

          this.activeFilterName = '" ' + name + ' "'
        }
        this.menu_filter = false
        this.showForFilter = true
        this.$router.replace({
          ...this.$router.currentRoute,
          query: {}
        })
        this.infoText = 'Ждите, идёт загрузка фильтра'

        setTimeout(() => {
          this.showForFilter = false
        }, 2000)
      })
    },

    resetFilter() {
      for (const key in this.filters) {
        if (key === 'searchMarketTH') {
          this.filters[key] = []
          continue
        }
        this.filters[key] = ''
      }
      this.activeFilterName = ''
      this.menu_filter = false
      this.$router.replace({ ...this.$router.currentRoute, query: {}})
    },

    setParentFilters(val) {
      this.Filters = [...val]
    },

    setType(val) {
      if (val) this.filters.searchMarketType = val.name
    },

    setTpFilter(val) {
      this.filters.searchMarketTH = val
    },

    resetTpFilter() {
      this.filters.searchMarketTH = []
      this.filters.searchMarketType = ''
    },

    // ================================================================ //

    gotoMainZip(id) {
      this.$router.replace('/zip/#' + id)
    },

    gotoMainModels(id) {
      this.$router.replace('/models/#' + id)
    },

    namePlusArt(item) {
      return item.ids
        ? '(' + item.zipID + ') ' + item.zipNAME + ' — ' + item.zipART
        : item.zipID
          ? '(' + item.zipID + ') ' + item.zipNAME + ' — (X) Нет в маркете'
          : null
    },
    namePlusModel(item) {
      return item.ID && item.TYPE && item.MODEL && item.VENDOR
        ? '(' + item.ID + ') ' + item.TYPE + ' — ' + item.MODEL + ' (' + item.VENDOR + ')'
        : null
    },
    idNameTypeArtPNModels(item) {
      return item.marketid && item.marketART && item.marketCOND && item.marketSUPPLIER && item.marketNAME && item.marketPN && item.marketMODELS
        ? '(' + item.marketid + ') ' + '[' + item.marketART + ', ' + item.marketCOND + ', ' + item.marketSUPPLIER + '] ' + item.marketNAME + ' (' + item.marketPN + ') - ' + item.marketMODELS
        : null
    },
    ratingColor(rating) {
      let color = ''
      switch (rating) {
        case 1: {
          color = 'red'; break
        }
        case 2: {
          color = 'orange'; break
        }
        case 3: {
          color = 'yellow'; break
        }
        case 4: {
          color = 'lime'; break
        }
        case 5: {
          color = 'green'; break
        }
        default: color = 'grey lighten-1'
      }
      return color
    },
    replaceComma(item) {
      if (item && item.includes(',')) {
        return item.replace(/,/g, '<br />')
      } else return item
    },

    close() {
      this.editedItem = { ...this.defaultItem }
      this.editedItem.ZipAfterSave = {}
      this.Parts = []
      this.editedIndex = -1

      this.dialog = false
    },

    /*  =====================================  ЗАКАЗЫ  ======================================   */

    handleCommandOrders(command) {
      if (command === 'showBasket') this.showBasket = true
      if (command === 'showOrders') this.showOrders = true
    },

    updateFromBasket(val) {
      this.isUpdateFromBasket = val
    },

    async itemToBasket(item) {
      if (item.marketPRICE && item.marketPRICE !== 0) {
        if (await this.$refs.confirm_with_count.open('Кол-во товара:', 'Добавить?', item.marketid, { color: 'orange' })) {
          this.$store.commit('setData', 'Позиция добавлена в корзину.')
        } else {
          this.$store.commit('setInfo', 'Добавление отменено.')
        }
      } else {
        this.$store.commit('setInfo', 'Товар не имеет цены! Добавление не может быть продолжено.')
      }
    },
    addItemToBasket(data) {
      const marketBasket = JSON.parse(localStorage.getItem('marketBasket'))
      if (marketBasket) {
        const isInBasket = marketBasket.CurrentOrder.find(i => i.marketid === data.marketid)
        if (isInBasket) isInBasket.Count = Number(isInBasket.Count) + Number(data.Count)
        else marketBasket.CurrentOrder.push(data)
        localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: marketBasket.CurrentOrder }))
        this.$store.dispatch('setBasket', { CurrentOrder: marketBasket.CurrentOrder })
      } else {
        this.CurrentOrder.push(data)
        localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: this.CurrentOrder }))
        this.$store.dispatch('setBasket', { CurrentOrder: this.CurrentOrder })
      }
    },

    // =================================== Получение данных ===================================== //

    getData() {
      console.time('Loading Data')

      this.ZipList = [...this.market] // this.ZipList = this.market.map(item => transformPriceWithRate(item))

      this.ZipList.forEach(item => {
        if (item.marketSUPPLIER) this.multiSelects.marketSupp.push(item.marketSUPPLIER)
        if (item.marketCOND) this.multiSelects.marketCond.push(item.marketCOND)

        const tp = this.TechProperties.find(i => i.zip === item.marketid)
        tp
          ? item['marketTH'] = tp.ids
          : item['marketTH'] = []
      })

      this.lastItemId = this.ZipList[this.ZipList.length - 1].id

      console.timeEnd('Loading Data')
    },

    editTechProps(item) {
      this.dialogTechProps = true
      this.editedItem = { ...item }
    },

    // ================================  УДАЛЕНИЕ ПОЗИЦИИ ==================================== //

    deleteItem(item) {
      this.loading = true
      const index = this.ZipList.indexOf(item)

      setTimeout(() => {
        checkInRemonts({ id: item.marketid })
          .then(res => {
            let question = ''

            res.zID !== null
              ? question = confirm('Данная позиция выбрана в незакрытых ремонтах. Открыть отдельное окно Jira для их редактирования? Количество запросов - ' + res.Qty + ' шт.')
              : question = confirm('Вы уверены, что хотите удалить эту позицию в Маркете?')

            if (!res.zID) {
              if (question) {
                remove({ id: item.marketid, email: this.$store.getters.currentUser.email, username: getUserName(this.$store.getters.currentUser.email) })
                  .then(() => {
                    this.ZipList.splice(index, 1)
                    this.loading = false
                    this.$store.commit('setData', `Позиция с id ${item.marketid} успешно удалена.`)
                  })
                  .catch(error => this.$store.commit('setError', error.message))
              } else this.loading = false
            } else {
              if (question) window.open('http://support.atlas-pro24.local/issues/?jql=id in (' + res.zID + ')')
            }
          })
          .catch(error => {
            this.$store.commit('setError', error.message)
          })
      }, 500)
    },

    /* ========================================= Редактирование позиции ======================================== */

    editItem(item) {
      this.editedItem = { ...item }
      this.editedIndex = this.ZipList.indexOf(item)

      if (typeof item.marketPRICE === 'number') item.marketPRICE = JSON.stringify(item.marketPRICE)

      this.marketTitle = this.editedItem.marketNAME
      this.ART_1C = item.marketART

      if (this.editedItem.ZipAfterSave === undefined || _.isEmpty(this.editedItem.ZipAfterSave)) this.editedItem.ZIP = this.Zip.find(z => z.zipID === item.marketID)
      else this.editedItem.ZIP = Object.assign({}, this.editedItem.ZipAfterSave)
      this.editedItem.MODELS = this.Models.find(model => (model.ID === item.marketID) && (item.elementTYPE === 2 || item.elementTYPE === 'МОДЕЛЬ'))

      this.dialog = true
    },

    /* ========================================== СОХРАНЕНИЕ ================================================= */

    save() {
      let elementTYPE = null
      let elementID = null

      const email = this.$store.getters.currentUser.email
      const objCond = this.$store.getters.conditions.find(c => c.name_ru === this.editedItem.marketCOND)
      const objSupp = this.$store.getters.suppliers.find(c => c.name === this.editedItem.marketSUPPLIER)
      const objCur = this.$store.getters.currency.find(c => c.sign === this.editedItem.CUR)

      if ((this.editedItem.elementTYPE === 1 || this.editedItem.elementTYPE === 'ЗИП') && !(_.isEmpty(this.editedItem.ZIP))) {
        elementTYPE = 1
        elementID = this.editedItem.ZIP.zipID
      }

      if ((this.editedItem.elementTYPE === 2 || this.editedItem.elementTYPE === 'МОДЕЛЬ') && !(_.isEmpty(this.editedItem.MODELS))) {
        elementTYPE = 2
        elementID = this.editedItem.MODELS.ID
      }

      const data = {

        id: this.editedItem.marketid,
        price: parseFloat(this.editedItem.marketPRICE),
        k1: parseFloat(this.editedItem.K1),
        k2: parseFloat(this.editedItem.K2),
        currency: +objCur.id,
        pn: this.editedItem.marketPN,
        articul: this.editedItem.marketART,
        condition: +objCond.id,
        supplier: +objSupp.id,
        site: this.editedItem.marketSITE ? 1 : 0,
        pack: this.editedItem.marketPack ? +this.editedItem.marketPack : null,
        desc: this.editedItem.marketDESC,
        elementTYPE,
        elementID,
        email,
        username: getUserName(email)

      }

      if (this.editedIndex > -1) {
        const objValid = () => {
          if (this.editedItem.elementTYPE === 1) return this.$refs.objZIP.validate()
          if (this.editedItem.elementTYPE === 2) return this.$refs.objMODELS.validate()
        }

        if (this.$refs.price.validate() && this.$refs.ratio.validate() && this.$refs.cur.validate() && objValid()) {
          update(data)
            .then(async response => {
              if (response.affectedRows > 0) {
                this.ZipList = []
                await this.$store.dispatch('market_new/get')
                await this.getData()

                this.$store.dispatch('setData', `Позиция с id ${this.editedItem.marketid} успешно обновлена.`)

                this.close()
              }
            })
            .catch(error => {
              this.$store.commit('setError', error.message)
            })
        }
      } else {
        if (this.$refs.price.validate() && this.$refs.ratio.validate() && this.$refs.cur.validate() && this.$refs.element.validate() && this.$refs.supp.validate() && this.$refs.cond.validate()) {
          const part_ids = this.Parts.map(item => item.marketid)

          add(this.Parts.length ? [data, part_ids] : [data])
            .then(async response => {
              if (response.affectedRows > 0) {
                this.ZipList = []
                await this.$store.dispatch('market_new/get')
                await this.getData()

                this.$store.dispatch('setData', `Позиция с id ${response.insertId} успешно добавлена.`)

                this.close()
              }
            })
            .catch(error => {
              this.$store.commit('setError', error.message)
            })
        } else {
          this.$store.dispatch('setError', 'Заполните соответствующие поля!')
          this.localLoading = false
        }
      }
    },

    async init() {
      if (window.location.hash) {
        const id = window.location.hash.replace(/[^0-9]/gim, '')
        this.filters.searchMarketZipID = id
      }
      this.maxWidth = localStorage.getItem('sizeColName')
    }
  }

}
</script>

<style scoped>
.v-input--selection-controls {
  margin-top: 5px !important;
  padding-top: 5px !important;
}
.v-list-item {
  min-height: 25px !important;
}
.th {
  margin-right: 8px;
  font-size: 14px;
}
.models {
	word-break: break-all;
}
.xlsx_btn {
	cursor: pointer;
	touch-action: none;
}
.maxWidth {
	max-width: 100px !important;
}
.minWidth {
	min-width: 200px !important;
}
.noWrap {
    white-space: nowrap;
}

.el-dropdown {
  margin-right: 10px !important;
}
</style>
