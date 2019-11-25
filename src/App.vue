<template>
    <section id="app" class="container">
      <div v-if="$auth.check()">
      <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <img src="@/assets/images/freeriga.jpg" width="28" height="28" />
          </a>
        </div>
        <div id="statusBar" class="navbar-menu">
          <div class="navbar-item has-dropdown is-hoverable">
            <a v-if="!human" class="navbar-item id_button" @click="takeName">
              <span style="padding: 0.4rem; border: 1px solid black;">
                {{ $t("message.signed_in_as") }}
                <strong>{{ username }} </strong> @ 
                <span v-if="locations[location]"> {{ locations[location].attributes.name }}</span>
              </span>
            </a>
          
            <a v-else class="navbar-link id_button" href="#">

              <span style="padding: 0.4rem; border: 1px solid black;">
                <img v-if="profileEdit.attributes.avatar_icon" :src="profileEdit.attributes.avatar_icon" />
                {{ $t("message.signed_in_as") }}
                <strong>{{ username }} </strong> @ 
                <span v-if="locations[location]"> {{ locations[location].attributes.name }}</span>
              </span>
            </a>
            <div class="navbar-dropdown">
              <a v-if="human" href="#" v-on:click="editingProfile = !editingProfile" class="navbar-item">{{ $t("message.change_profile") }}</a>
              <a class="navbar-item" v-on:click="logout">{{ $t("message.sign_out") }}</a>
            </div>
          </div>
          <div class="navbar-item">
            <button class="button is-primary" @click="togglePostModal">{{ $t("message.new_post") }}</button>
          </div>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <button class="button is-small is-secondary is-outline" :class="locale == 'lv' ? 'is-success' : ''" v-on:click="setLocale('lv')">LAT</button>        
              <button :class="locale == 'en' ? 'is-success' : ''" class="button is-small is-secondary is-outline" v-on:click="setLocale('en')">ENG</button>
              <button :class="locale == 'ru' ? 'is-success' : ''" class="button is-small is-secondary is-outline" v-on:click="setLocale('ru')">РУ</button>
              
            </div>
          </div>
        </div>

        <div class="modal" id="edit_profile" v-if="human" :class="editingProfile ? 'is-active' : ''">
          <div class="modal-background"></div>
          <div class="modal-content" v-if="!profileSubmitting">
            <form v-on:submit.prevent="editProfile">
              <div class="columns">
                <div class="column">
                  <label class="label">{{ $t("message.your_name") }}</label>
                  <input class="input" v-model="profileEdit.attributes.name" type="text" />
                </div>
              </div>
              <div class="columns">
                <div class="column">
                  <label class="label">{{ $t("message.your_nickname") }}</label>
                  <input class="input" v-model="profileEdit.attributes.nickname" type="text" />
                </div>
              </div>
              <div class="columns">
                <div class="column">
                  <p>{{ $t("message.attach_image") }}</p>
                  <img :src="avatarPreview" />
                  <div class="file">
                    <label class="file-label">
                      <input class="file-input" type="file" ref="avatarFile" @change="previewAvatar($event)">
                      <span class="file-cta">
                        <span class="file-icon">
                          <i class="fas fa-upload"></i>
                        </span>

                        <span class="file-label">
                          Choose a file…
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="columns">
                <div class="column">
                  <input class="button is-primary" type="submit" :value="$t('message.save')" />
                </div>
              </div>              
            </form>
          </div>
          <div class="modal-content" v-else>
            <div class="loading">
              <img src="@/assets/images/fr_spin.gif" />
            </div>
          </div>
          <button class="modal-close is-large" @click="editingProfile = !editingProfile" aria-label="close"></button>
        </div>

        <div class="modal" :class="changingName ? 'is-active' : ''">
          <div class="modal-background"></div>
          <div class="modal-content">
            <form v-on:submit.prevent="changeName">
              <p>{{ $t("message.new_name") }}<input class="input" v-model="newName" type="text" />
              {{ $t("message.which_quarter") }}</p>
              <div class="select">
                <select v-model="newQuarter" @change="getLocations">
                  <option v-for="quarter in quarters" :key="quarter.id"  :value="quarter.id">{{ quarter.attributes.name }}</option>
                </select>
              </div>
              <p>{{ $t("message.where_are_you") }}</p>
              <div class="select">
                <select v-model="newLocation">
                  <option v-for="location in selectLocations" :key="location.id" :value="location.id">{{ location.attributes.name }}</option>
                </select>
                <a href="#" class="button is-secondary" v-if="human" @click="addLocationDialogue = !addLocationDialogue">{{ $t("message.add_new_location") }}</a>

              </div>
              <div v-show="addLocationDialogue">
                name: <input v-model="customLocation" type="text" class="input">
                <button>{{ $t("message.add") }}</button>
              </div>
              <p>{{ $t("message.what_mood_are_you_in") }}</p>
              <color-picker
                :color="newColour"
                @changeColor="changeColor"
              ></color-picker>
              <input class="button is-primary" type="submit" :value="$t('message.change')" />
            </form>
          </div>
          <button class="modal-close is-large" @click="changingName = !changingName" aria-label="close"></button>
        </div>      
      </nav>

      <div id="post" class="modal" :class="postModal ? 'is-active' : ''" v-if="locations[location]">
        <div class="modal-background"></div>
        <div class="modal-content" v-if="!submittingTask">
          {{ $t("message.posting_as") }} {{ username }} @ {{ locations[location].attributes.name }}
          <tabs animation="slide" :only-fade="false">
            <tab-pane :label="$t('message.Task')">
              <h2 class="title">{{ $t("message.post_a_new_task") }}</h2>
              <p>{{ $t("message.post_blurb") }}</p>
              <form v-on:submit.prevent="submitTask">
                <div class="columns">
                  <div class="column">
                    <p>{{ $t("message.which_quarter") }}</p>
                    <div class="select">
                      <select v-model="newQuarter" @change="getLocations">
                        <option v-for="quarter in quarters" :key="quarter.id" :value="quarter.id">{{ quarter.attributes.name }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="column">
                    <p>{{ $t("message.which_location") }}</p>
                    <div class="select">    
                      <select v-model="newTask['location_id']">
                        <option v-for="l in selectLocations" :selected="l.id === location" :key="l.id" :value="l.id">{{ l.attributes.name }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="columns">
                  <div class="column">            
                    <p>{{ $t("message.whats_going_on") }}</p>
                  </div>
                </div>
                <div class="columns" v-show="lv[0]">
                  <div class="column">
                     <div class="input_flag" >
                      <img src="@/assets/images/lv.gif" width="25" />
                     </div>
                     <textarea class="textarea is-small comment" v-model="newTask['lv']"></textarea>
                  </div>
                </div>
                <div class="columns" v-show="en[0]">
                  <div class="column">
                    <div class="input_flag">
                      <img src="@/assets/images/en.gif" width="25" />
                    </div>
                    <textarea class="textarea is-small comment" v-show="en[0]" v-model="newTask['en']"></textarea>
                  </div>
                </div>
                <div class="columns" v-show="ru[0]">
                  <div class="column">
                    <div class="input_flag">
                      <img src="@/assets/images/ru.gif" width="25" />
                    </div>
                    <textarea class="textarea is-small comment" v-model="newTask['ru']"></textarea>
                  </div>
                </div>
                <div class="columns">
                  <div class="column">
                      <button @click.prevent="addTextarea(0, loc)" v-for="loc in availableLocales" :key="'add_newtask_' + loc" v-show="(locale !== loc)"> + <img  :src="require('@/assets/images/' + loc + '.gif')" width="25" /></button> 
                  </div>
                </div>
                <div v-if="human" class="columns">
                  <div class="column">
                    <p>{{ $t("message.attach_image") }}</p>
                    <img :src="imgPreview" />
                    <div class="file">
                      <label class="file-label">
                        <input class="file-input" type="file" ref="imageFile" @change="previewFiles($event, 'task')">
                        <span class="file-cta">
                          <span class="file-icon">
                            <i class="fas fa-upload"></i>
                          </span>

                          <span class="file-label">
                            Choose a file…
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="columns">
                  <div class="column">
                    <p>{{ $t("message.task_status") }}</p>
                    <div class="select">
                      <select v-model="newTask['status']">
                        <option selected disabled>{{ $t("message.choose_whether") }}</option>
                        <option value="0">{{ $t("message.past") }}</option>
                        <option value="1">{{ $t("message.present") }}</option>
                        <option value="2">{{ $t("message.future") }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="columns">
                  <div class="column">
                    <input class="button is-primary" type="submit" :value="$t('message.post')">
                  </div>
                </div>
              </form>
            </tab-pane>
            <tab-pane :label="$t('message.Comment')">
              <p>Post a comment or general discussion</p>
              <form v-on:submit.prevent="submitComment">
                <div class="columns">
                  <div class="column">
                    <p>{{ $t("message.which_quarter") }}</p>
                    <div class="select">
                      <select v-model="newComment['quarter_id']" @change="getLocationsComment">
                        <option v-for="quarter in quarters" :key="quarter.id" :value="quarter.id">{{ quarter.attributes.name }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="column">
                    <p>{{ $t("message.which_location") }}</p>
                    <div class="select">    
                      <select v-model="newComment['location_id']">
                        <option>{{ $t('message.no_location') }}</option>
                        <option v-for="cl in selectLocationsComment" :selected="cl.id === location" :key="cl.id" :value="cl.id">{{ cl.attributes.name }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="columns">
                  <div class="column">            
                    <p>{{ $t("message.what_do_you_want_to_say") }}</p>
                  </div>
                </div>
                <div class="columns" v-show="lv[0]">
                  <div class="column">
                     <div class="input_flag" >
                      <img src="@/assets/images/lv.gif" width="25" />
                     </div>
                     <textarea class="textarea is-small comment" v-model="newComment['lv']"></textarea>
                  </div>
                </div>
                <div class="columns" v-show="en[0]">
                  <div class="column">
                    <div class="input_flag">
                      <img src="@/assets/images/en.gif" width="25" />
                    </div>
                    <textarea class="textarea is-small comment" v-show="en[0]" v-model="newComment['en']"></textarea>
                  </div>
                </div>
                <div class="columns" v-show="ru[0]">
                  <div class="column">
                    <div class="input_flag">
                      <img src="@/assets/images/ru.gif" width="25" />
                    </div>
                    <textarea class="textarea is-small comment" v-model="newComment['ru']"></textarea>
                  </div>
                </div>
                <div class="columns">
                  <div class="column">
                      <button @click.prevent="addTextarea(0, loc)" v-for="loc in availableLocales" :key="'add_newcomment_' + loc" v-show="(locale !== loc)"> + <img  :src="require('@/assets/images/' + loc + '.gif')" width="25" /></button> 
                  </div>
                </div>             
                <div class="columns">
                  <div class="column">
                    <input class="button" type="submit" value="Post">
                  </div>
                </div>
              </form>
            </tab-pane>
          </tabs>
        </div>
        <div class="modal_content" v-else>
          <div class="loading">
            <img src="@/assets/images/fr_spin.gif" />
          </div>
        </div>
        <button class="modal-close is-large" @click="togglePostModal" aria-label="close"></button>
      </div>

      <main class="main" v-if="!loading">
        <div class="columns masonry_wrap"  v-masonry="masonryId" stagger="0.03s" transition-duration="0.3s" item-selector=".fr_card">
          <div class="fr_card column is-one-third" v-masonry-tile  :key="entry.id" v-for="entry in entries">
            <article class="box" :style="'border-color: ' + entry.attributes.colour">
              <div class="columns">
                <div class="column">
                  <h2 class="subtitle" :style="'color: ' + entry.attributes.colour">{{ entry.attributes.username }} @ {{ entry.attributes.user_location_name }}</h2>
                </div>
              </div>
              <div class="columns">
                <div class="column">

                  <span v-if="entry.attributes.item_type == 'Comment'">{{ $t("message.Comment") }} </span><span v-else>{{ $t("message.Task") }} </span> : {{ entry.attributes.location_name }}
                </div>
                <div class="column status has-text-right">
                  <div v-if="entry.attributes.status === 0">{{ $t("message.past_status") }}</div>
                  <div v-if="entry.attributes.status === 1">{{ $t("message.present_status") }}</div>
                  <div v-if="entry.attributes.status === 2">{{ $t("message.future_status") }}</div>
                  <div class="date"><timeago :locale="locale" :datetime="entry.attributes.created_at"  :auto-update="60"></timeago></div>
                </div>
              </div>
              <div class="columns" v-if="entry.attributes.image_box">
                <div class="column">
                  <img class="post_image" :src="entry.attributes.image_box" />
                </div>
              </div>
              <div class="columns">
                <div class="column">
                  <tabs animation="slide" :only-fade="false" v-if="entry.attributes.translations_count > 1">
                    <tab-pane :key="'translation_' + locale + entry.id" v-for="locale in Object.keys(entry.attributes.translations_hash)" :label="locale">
                      <blockquote>
                        {{ entry.attributes.translations_hash[locale] }}
                      </blockquote>
                    </tab-pane>
                  </tabs>
                  <blockquote v-else>
                    {{ entry.attributes.text }}
                  </blockquote>

                </div>
              </div>

              <div class="comment_container" v-if="entry.attributes.comments.length > 0">
                <div class="columns">
                  <div class="column"><h3 class="subtitle">
                    <span v-if="entry.attributes.comments.length > 1">
                      {{ entry.attributes.comments.length }}
                    </span>
                    {{ $t("message.comments") }}</h3></div>
                </div>
                <div class="columns" v-if="entry.attributes.comments.length > 3">
                  <button class="button is-small is-primary" @click="expandComments(entry.id)">
                    <span v-if="expanded === entry.id">{{ $t("message.see_less") }}</span>
                    <span v-else>{{ $t("message.see_all") }}</span></button>
                </div>
                <div class="comment" v-show="(entry.attributes.comments.length < 4) || expanded === entry.id || index > (entry.attributes.comments.length - 3)" :style="'border-color: ' + comment.colour" v-for="(comment, index) in entry.attributes.comments" :key="comment.id">
                  <div class="columns">
                    <div class="column">
                      {{ comment.username }} @ {{ locations[comment.location_id].attributes.name }}:<br />
                    </div>
                    <div class="column date has-text-right">
                      <timeago :locale="locale" :datetime="comment.updated_at"  :auto-update="30"></timeago>
                    </div>
                  </div>
                  <div class="columns">
                    <div class="column">
                      <tabs animation="slide" :only-fade="false" v-if="comment.translations_count > 1">
                        <tab-pane :key="'translation_' + locale + comment.id" v-for="locale in Object.keys(comment.translations_hash)" :label="locale">
                          <blockquote>
                            <span :style="'color: ' + comment.colour + '; font-weight: bold'">&#8594; &nbsp;</span>{{ comment.translations_hash[locale] }}</blockquote>
                          </tab-pane>
                        </tabs>
                      <blockquote v-else>
                        <span :style="'color: ' + comment.colour + '; font-weight: bold'">&#8594; &nbsp;</span>{{ comment.body }}
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
              <div class="columns">
                <div class="column">
                  <button class="button is-primary" @click="toggleCommentForm(entry.id)">{{ $t("message.discuss") }}</button>
                </div>
              </div>
              <div v-show="showForm[entry.id]">
                <form class="form" v-on:submit.prevent="leaveComment(entry.id)">
                  <div class="columns">
                    <div class="column">
                      <div class="input_flag" v-show="lv[entry.id]">
                        <img src="@/assets/images/lv.gif" width="25" />
                      </div>
                       <textarea class="textarea is-small comment" v-show="lv[entry.id]" v-model="comment[entry.id]['lv']"></textarea>
                    </div>
                  </div>
                  <div class="columns">
                    <div class="column">
                      <div class="input_flag" v-show="en[entry.id]">
                        <img src="@/assets/images/en.gif" width="25" />
                      </div>
                       <textarea class="textarea is-small comment" v-show="en[entry.id]" v-model="comment[entry.id]['en']"></textarea>
                    </div>
                  </div>
                  <div class="columns">
                    <div class="column">
                      <div class="input_flag" v-show="ru[entry.id]">
                        <img src="@/assets/images/ru.gif" width="25" />
                      </div>
                       <textarea class="textarea is-small comment" v-show="ru[entry.id]" v-model="comment[entry.id]['ru']"></textarea>
                    </div>
                  </div>                                
                  <div class="columns">
                    <div class="column">
                      <button @click.prevent="addTextarea(entry.id, loc)" v-for="loc in availableLocales" :key="'add_' + loc + entry.id" v-show="locale !== loc"> + <img  :src="require('@/assets/images/' + loc + '.gif')" width="25" /></button> 
                    </div>
                  </div>
                  <div class="columns">
                    <div class="column">
                      <input class="button is-primary" type="submit" :value="$t('message.submit_comment')" />
                    </div>
                  </div>
                </form> 
              </div>
            </article>
          </div>
        </div>
        <div class="loading has-text-centered" v-show="loadingMore">
          <img src="@/assets/images/fr_spin.gif" />
        </div>
        <div class="columns end_of_data" v-show="dataOver">
          <div class="column">
            <h2 class="subtitle">
              {{ $t("message.end_of_data" ) }}
            </h2>
          </div>
        </div>
      </main>
      <main v-else>
        <div class="loading">
          <img src="@/assets/images/fr_spin.gif" />
        </div>
      </main>
    </div>
    <div v-else>
      <div class="container">
        <div class="columns">
          <div class="column is-half">
            <img src="@/assets/images/freeriga.jpg">
          </div>
          <div class="column is-half">
            <div class="buttons are-large">
              <button class="button is-primary">
                <router-link :to="{name: 'TerminalLogin'}">
                  {{ $t("message.sign_in_terminal") }}
                </router-link>
              </button>
              <button class="button is-primary">
                <router-link :to="{name: 'UserLogin'}">
                  {{ $t("message.sign_in_user") }}
                </router-link>
              </button>
            </div>
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>

import _ from 'lodash'
import { mapState } from 'vuex'
import normalize from 'json-api-normalizer'
import { Tabs, TabPane } from 'vue-bulma-tabs'
import colorPicker from '@caohenghu/vue-colorpicker'

export default {
  name: 'app',
  data () {
    return {
      latestPost: 0,
      addLocationDialogue: false,
      customLocation: '',
      loadingMore: false,
      expanded: 0,
      postModal: false,
      profileSubmitting: false,
      loading: true,
      availableLocales: ['lv', 'en', 'ru'],
      showForm: [],
      lv: [],
      profileEdit: {},
      en: [],
      submittingTask: false,
      masonryId: 'masonryContainer',
      ru: [],
      newTaskInput: {},
      editingProfile: false,
      formData: new FormData(),
      profileForm: new FormData(),
      comment: {},
      locale: null,
      changingName: false,
      newTask: {},
      newComment: {},
      newRootComment: {},
      newName: '',
      newColour: '#333',
      newQuarter: null,
      newLocation: null,
      quarters: [],
      imgPreview: '',
      avatarPreview: '',
      locations: {},
      selectLocations: [],
      selectLocationsComment: [],
      entries: [],
      page: 1,
      onSocket: false,
      dataOver: false,
      uploadedImage: null,
      uploadedAvatar:null,
      signedIn: false
    }
  },
  channels: {
    SiteChannel: {
      connected() {
        // console.log('I am connected.')
        this.onSocket = true
      },
      rejected() {
        this.onSocket = false
      },
      received(data) {
        // console.log('async : ' + this.latestPost)
        // console.log('Message received')
        this.updateFromSocket(JSON.parse(data))
      },
      disconnected() {
        this.onSocket = false
      }
    }
  },
  components: {
    Tabs,
    TabPane,
    colorPicker
  },
  methods: {
    previewAvatar () {
      let files = this.$refs.avatarFile.files
      this.uploadedAvatar = this.$refs.avatarFile
      let reader = new FileReader()
      reader.onload = (event) => {
        this.avatarPreview = event.target.result
      }
      reader.readAsDataURL(files[0])
      this.profileForm.append('user[avatar]',files[0])
    },
    previewFiles (file, klass) {
      let files = this.$refs.imageFile.files
      this.uploadedImage = this.$refs.imageFile
      let reader = new FileReader()
      reader.onload = (event) => {
        this.imgPreview = event.target.result
      }
      reader.readAsDataURL(files[0])
      this.formData.append(klass + '[image]', files[0])
    },
    logout () {
      this.$auth.logout({
        makeRequest: true,
        success() {
          window.removeEventListener('scroll', this.scroll())
          this.$store.commit('changeHuman', false)
        },
        error(e) {
          // console.log(e)

        },
      })
    },
    scroll () {
      window.onscroll = () => {
        let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight - 25

        if (bottomOfWindow) {
          this.loadingMore = true
          this.axios.get('/v1/entries?page=' + this.page)
            .then((response) => {
              if (response.data.data.length > 0) {
                response.data.data.forEach((entry) => {
                  this.prepareEntry(entry.id)
                  this.entries.push(entry)
                })
                this.page++
              } else {
                this.dataOver = true
              }
              this.loadingMore = false
              this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
            })
          }
      }
    },
    close (e) {
      if (e.keyCode === 27) {
        this.postModal = false
        this.changingName = false
        this.editingProfile = false
        document.removeEventListener('keyup', this.close)
      }
    },
    expandComments (entryId) {
      if (this.expanded === entryId) {
        this.expanded = false
      } else {
        this.expanded = entryId
      }
      this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
    },
    togglePostModal () {
      this.postModal = !this.postModal
      if (this.postModal) document.addEventListener('keyup', this.close)
    },
    submitComment () {
      this.latestPost = 0
      let url = ''
      if (this.newComment.location_id) {
        url = '/v1/locations/' + this.newComment.location_id + '/comments'
      } else {
        this.newComment.location_id = this.$store.state.location
        url = '/v1/quarters/' + this.newComment.quarter_id + '/comments'
      }
      this.newComment.username = this.$store.state.name
      this.newComment.colour = this.$store.state.colour
      this.newComment.translations_attributes = []
      this.availableLocales.forEach((l) => {
        if (this.newComment[l]) {
          this.newComment.translations_attributes.push({locale: l, body: this.newComment[l] })
        }
      })
      if (this.$store.state.human) this.newComment.user_id = this.$auth.user().data.id
      this.axios.post(url, this.newComment)
        .then((response) => {
          this.newComment = {}
          this.togglePostModal()
          this.prepareEntry(response.data.data.id)
          this.latestPost = response.data.data.id
          if (!this.onSocket) this.entries.unshift(response.data.data)
          this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
        })
    },
    authenticate: function (provider) {
      this.$auth.authenticate(provider).then(function () {
       // Execute application logic after successful social authentication
      })
    },
    submitTask () {
      this.submittingTask = true
      if (!this.newTask.location_id) {
        this.$toasted.error(this.$t("message.location_required"), {
          position: 'bottom-center',
          fullWidth: true,
          fitToScreen: true,
          closeOnSwipe: true,
          duration: 2500
        })
        this.submittingTask = false
        this.postModal = true
        return false
      }
      if (!this.newTask.status) {
        this.$toasted.error(this.$t("message.status_required"), {
          position: 'bottom-center',
          fullWidth: true,
          fitToScreen: true,
          closeOnSwipe: true,
          duration: 2500
        })
        this.submittingTask = false
        this.postModal = true
        return false
      }
      this.latestPost = 0
      let url = '/v1/locations/' + this.newTask.location_id + '/tasks'
      this.formData.append('task[username]', this.$store.state.name)
      this.formData.append('task[colour]', this.$store.state.colour)
      this.formData.append('task[status]', this.newTask.status)
      this.formData.append('task[user_location_id]', this.$store.state.location)
      if (this.$store.state.human) this.formData.append('task[user_id]', this.profileEdit.id)
      this.availableLocales.forEach((l, index) => {
        if (this.newTask[l]) {
          this.formData.append('task[translations_attributes][' + index + '][locale]', l)
          this.formData.append('task[translations_attributes][' + index + '][summary]', this.newTask[l])
        }
      })
      // console.log('submitting: ' )
      // console.log(this.formData)
      this.axios({method: 'post', url: url, data: this.formData,
        header: {
          'Content-Type' : 'multipart/form-data'
        }})
        .then((response) => {
          this.submittingTask = false
          this.togglePostModal()
          this.prepareEntry(response.data.data.id)
          this.latestPost = response.data.data.id
          if (!this.onSocket)  this.entries.unshift(response.data.data)
          this.newTask = {}
          this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
        })
    },
    rgb2hex (rgb){
     rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
     return (rgb && rgb.length === 4) ? "#" +
      ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    },
    changeColor(color) {
      const { r, g, b, a } = color.rgba
      this.newColour = this.rgb2hex(`rgba(${r}, ${g}, ${b}, ${a})`)
    },
    toggleCommentForm (entryId) {
      this.$set(this.showForm, entryId, !this.showForm[entryId])
      this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
    },
     addTextarea (entryId, locale) {
      if (locale === 'lv') {
        this.$set(this.lv, entryId, true)
      }
      if (locale === 'ru') {
        this.$set(this.ru, entryId, true)
      }
      if (locale === 'en') {
        this.$set(this.en, entryId, true)
      } 
      this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
    },
    leaveComment (entryId) {
      this.latestPost = 0
      let postComment = { username: this.$store.state.name, location_id: this.$store.state.location, colour: this.$store.state.colour }
      postComment.translations_attributes = []
      this.availableLocales.forEach((locale) => {
        postComment.translations_attributes.push({locale: locale, body: this.comment[entryId][locale] })
        this.comment[entryId][locale] =''
      })
      if (this.$store.state.human) postComment.user_id = this.profileEdit.id
      this.axios.post('/v1/entries/' + entryId + '/comments', postComment)
        .then((response) => {
          let postedComment = response.data.data

          // let entryIndex = this.entries.findIndex((e) => parseInt(e.id) == parseInt(postedComment.id))
           _.remove(this.entries, function(n) {
            return parseInt(n.id) == parseInt(postedComment.id)
          })
           // this.prepareEntry(postedComment.id)
           this.entries.unshift(postedComment)
           this.latestPost = postedComment.id
           this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
        })
    },
    updateFromSocket (entry) {
      // console.log(entry.data)
      let wiped = _.remove(this.entries, function(n) {
        return parseInt(n.id) == parseInt(entry.data.id)
      })
      if (wiped.length === 0) {
        this.prepareEntry(entry.data.id)
      }
      this.entries.unshift(entry.data)
      this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
    },
    setLocale (locale) {
      this.locale = locale
      this.$root.$i18n.locale = locale
      localStorage.setItem('locale', locale)
      this.$timeago.locale = locale
      //  reset input form
      if (!this.newTask['en']) this.en[0] = false
      if (!this.newTask['lv']) this.lv[0] = false
      if (!this.newTask['ru']) this.ru[0] = false
      if (!this.newComment['en']) this.en[0] = false
      if (!this.newComment['lv']) this.lv[0] = false
      if (!this.newComment['ru']) this.ru[0] = false
      this.entries.forEach((entry) => {
        if (locale == 'ru') {
          this.ru[entry.id] = true
          if (!this.comment[entry.id]['en']) {
            this.en[entry.id] = false
          }
          if (!this.comment[entry.id]['lv']) {
            this.lv[entry.id] = false
          }
          this.ru[0] = true
        }
        if (locale == 'lv') {
          this.lv[entry.id] = true
          if (!this.comment[entry.id]['en']) {
            this.en[entry.id] = false
          }
          if (!this.comment[entry.id]['ru']) {
            this.ru[entry.id] = false
          }
          this.lv[0] = true
        }
        if (locale == 'en') {
          this.en[entry.id] = true
          if (!this.comment[entry.id]['lv']) {
            this.lv[entry.id] = false
          }
          if (!this.comment[entry.id]['ru']) {
            this.ru[entry.id] = false
          }
          this.en[0] = true
        }        
      })
      this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))
    },
    getLocations () {
      this.axios.get('/v1/quarters/' + this.newQuarter + '/locations')
        .then((response) => {
          this.selectLocations = response.data.data
        })
    },
    getLocationsComment () {
      this.axios.get('/v1/quarters/' + this.newComment.quarter_id + '/locations')
        .then((r) => {
          this.selectLocationsComment = r.data.data
          // alert(JSON.stringify(this.selectLocationsComment))
        })
    },    
    getSize () {
      return _.sample(['is-one-third', 'is-one-quarter'])
    },
    takeName () {
      this.changingName = true
      document.addEventListener('keyup', this.close)
    },
    changeName () {
      this.$store.commit('changeName', this.newName)
      this.$store.commit('changeQuarter', this.newQuarter)
      this.$store.commit('changeLocation', this.newLocation)
      this.$store.commit('changeColour', this.newColour)
      this.changingName = false
    },
    editProfile () {
      this.profileSubmitting = true
      this.profileForm.append('user[nickname]', this.profileEdit.attributes.nickname)
      this.profileForm.append('user[name]', this.profileEdit.attributes.name)
      this.axios({method: 'put', url: '/v1/users/' + this.profileEdit.id, data: this.profileForm,
        header: {
          'Content-Type' : 'multipart/form-data'
        }})
        .then((response) => {
          if (response.status === 200) {
            this.$toasted.success('Your profile has been updated.', {
              position: 'bottom-center',
              fullWidth: true,
              fitToScreen: true,
              closeOnSwipe: true,
              duration: 4000
            })
            this.profileForm = response.data.data
            this.editingProfile = false
            this.profileSubmitting = false
          }
        })

    },
    padZero(str, len) {
        len = len || 2;
        var zeros = new Array(len).join('0');
        return (zeros + str).slice(-len);
    },
    invertColour(hex, bw) {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        var r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // http://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        return "#" + this.padZero(r) + this.padZero(g) + this.padZero(b);
    },
    prepareEntry (id) {
      this.comment[id] = {}
      this.comment[id]['en'] = ''
      this.comment[id]['lv'] = ''
      this.comment[id]['ru'] = ''
      if (this.locale === 'en') {
        this.en[id] = true             
      } else {
        this.en[id] = false
      }
      if (this.locale === 'lv') {
        this.lv[id] = true 
      } else {
        this.lv[id] = false
      }
      if (this.locale === 'ru') {
        this.ru[id] = true 
      } else {
        this.ru[id] = false
      }                    
      this.showForm[id] = false
    },
    loadEverything (indicator) {
      window.addEventListener('scroll', this.scroll())
      // console.log('entered loadeverything from ' + indicator)
      this.axios.get('/v1/locations')
        .then((response) => {
          this.locations = normalize(response.data).location
          this.newQuarter = this.locations[this.$store.state.location].relationships.quarter.data.id
          this.selectLocations = response.data.data.filter((e) => e.relationships.quarter.data.id == this.locations[this.$store.state.location].relationships.quarter.data.id)
          this.newTask.location_id = this.$store.state.location
          this.newLocation = this.$store.state.location
        })
       
      this.axios.get('/v1/quarters')
        .then((response) => {
          this.quarters = response.data.data
        })
      this.axios.get('/v1/entries?page=' + this.page)
        .then((response) => {
          response.data.data.forEach((entry) => {
            this.prepareEntry(entry.id)
            this.entries.push(entry)

          })
          this.page++
          this.loading = false
        })
      this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))      
    } 
  },
  computed: {
    ...mapState({
      username: state => state.name,
      colour: state => state.colour,
      location: state => state.location,
      human: state => state.human
    })
  },
  mounted () {
    const _this = this;
    // Set up $auth.ready with other arbitrary loaders (ex: language file).
    setTimeout(() => {
      _this.loaded = true;
    }, 500)    
    this.$cable.subscribe({ channel: 'SiteChannel' })
    this.newName = this.username
    this.newColour = this.colour
    if (localStorage.locale) {
      this.locale = localStorage.getItem('locale')
      if (this.locale == 'en') {
        this.en[0] = true
      }
      else if (this.locale == 'lv') {
        this.lv[0] = true
      } else if (this.locale == 'ru') {
        this.ru[0] = true
      }
    } 
    else {
      this.lv[0] = true
      this.en[0] = false
      this.ru[0] = false      
    }
    // console.log(this.en[0])

    // if (this.$auth.check()) {
      // console.log('loading on mount, auth data is: ')
      // console.log(this.$auth.token())
      // console.log(this.$auth.token(null))
      // console.log(this.$auth.check())
      // console.log(this.$auth.user())
           
    // }
  },
  beforeMount () {
    this.axios.interceptors.response.use((response) => {
      return response
    }, function (error) {
      let originalRequest = error.config
      if (error.response) {
        if (error.response.status === 401 && !originalRequest._retry) {
          // console.log(originalRequest)
          this.$router.push({ name: 'TerminalLogin' })
        } 
      }
    })
  },
  created () {
    this.$auth.ready(function () {
      // console.log('auth is ready, check is: ')
      // console.log(this.$auth.check())
      if (this.$auth.check()) {
        // console.log('does user make it here? ')
        // console.log(this.$auth.user())
        this.loadEverything(' created, auth ready')
      } 
    })

    this.$on('update-user', updatedUser => {
      // console.log('entered update-user with:')
      // console.log(updatedUser)
      // console.log(this.$auth.user())
      this.profileEdit = updatedUser
      this.loadEverything('updated-user')
      this.$nextTick(() => this.$redrawVueMasonry('masonryContainer'))     
    })
    
  },
  watch: {
    locale: {
      handler () {
        this.$emit('locale', this.locale)
        localStorage.setItem('locale', this.locale)
      },
      deep: true
    }
  }
}
</script>

<style lang="scss">
@import 'assets/css/freeriga.scss';
</style>
