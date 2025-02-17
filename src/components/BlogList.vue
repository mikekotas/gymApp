<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div v-for="blog in displayedBlogs" :key="blog.id" class="col-12">
        <q-card class="blog-card">
          <q-card-section>
            <div class="text-h6">{{ blog.title }}</div>
            <div class="text-subtitle2">By {{ blog.author }} on {{ blog.date }}</div>
          </q-card-section>

          <q-card-section>
            {{ truncateContent(blog.content) }}
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
                <div class="text-subtitle2">By {{ blog.author }} on {{ blog.date }}</div>
              </q-card-section>

              <q-card-section>
                {{ blog.content }}
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
import { ref, computed } from 'vue'
import blogData from '../data/blogs.json'

const blogs = blogData.blogs
const currentPage = ref(1)
const itemsPerPage = 2
const expandedBlog = ref({})

const totalPages = computed(() => Math.ceil(blogs.length / itemsPerPage))

const displayedBlogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return blogs.slice(start, start + itemsPerPage)
})

const truncateContent = (content) => {
  return content.length > 100 ? content.slice(0, 100) + '...' : content
}

const expandBlog = (id) => {
  expandedBlog.value[id] = true
}

const isExpanded = (id) => {
  return expandedBlog.value[id]
}
</script>

<style scoped>
.blog-card {
  margin-bottom: 20px;
}
</style>
