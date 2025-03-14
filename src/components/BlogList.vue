<template>
  <div class="q-pa-md">
      <!-- Loading state -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <!-- Error state -->
    <div v-if="error" class="text-negative q-pa-md">
      Error loading blogs: {{ error }}
    </div>

    <div class="row q-col-gutter-md" v-else>
      <div v-for="blog in displayedBlogs" :key="blog.id" class="col-12">
        <q-card class="blog-card">
          <q-card-section>
            <div class="text-h6">{{ blog.title }}</div>
            <div class="text-subtitle2">By {{ blog.author }} on {{ formatDate(blog.date) }}</div>
          </q-card-section>

          <q-card-section>
            <div v-html="truncateContent(blog.content)"></div>
            <q-btn
              v-if="!isExpanded(blog.id)"
              flat
              color="primary"
              label="Read more"
              @click="expandBlog(blog.id)"
            />
          </q-card-section>

          <q-dialog v-model="expandedBlog[blog.id]">
            <q-card style="min-width: 350px">
              <q-card-section>
                <div class="text-h6">{{ blog.title }}</div>
                <div class="text-subtitle2">By By {{ blog.author }} on {{ formatDate(blog.date) }}</div>
              </q-card-section>

              <q-card-section>
                <div v-html="blog.content"></div>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Close" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-card>
      </div>
    </div>

    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="5"
        boundary-numbers
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const error = ref(null)
const blogs = ref([])
const currentPage = ref(1)
const itemsPerPage = 2
const expandedBlog = ref({})

// Replace with your Apps Script URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwaLPMqSuU0ZovxtNU_PnRZQYPc0PWr2UJIhdo1gPSDirtvjgDKYNp-24bQjAm_awut8Q/exec?api=true'

onMounted(async () => {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()
    blogs.value = data.blogs
  } catch (err) {
    error.value = err.message
    $q.notify({
      type: 'negative',
      message: 'Failed to load blogs'
    })
  } finally {
    loading.value = false
  }
})

const totalPages = computed(() => Math.ceil(blogs.value.length / itemsPerPage))

const displayedBlogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return blogs.value.slice(start, start + itemsPerPage)
})

const truncateContent = (content) => {
    // Strip HTML tags before truncating
    const textOnly = content.replace(/<[^>]*>/g, '')
  return textOnly.length > 100 ? textOnly.slice(0, 100) + '...' : textOnly
}

const expandBlog = (id) => {
  expandedBlog.value[id] = true
}

const isExpanded = (id) => {
  return expandedBlog.value[id]
}

const formatDate = (d) => {
  return date.formatDate(new Date(d), 'YYYY-MM-DD')
}
</script>

<style scoped>


.blog-card :deep() p {
  margin-bottom: 8px;
}

.blog-card :deep() ul {
  padding-left: 20px;
}

.blog-card :deep() img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}
</style>
