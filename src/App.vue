<script setup lang="ts">
import { computed, ref } from "vue";
import { getListHttp, type Hits } from "./api.ts";
import LoadingIcon from "./assets/loading.gif";
import { invoke } from "@tauri-apps/api/tauri";

const list = ref<Hits[]>([]);

// 分页
interface PageInfo {
  page: number;
  total: number;
}

const pageInfo = ref<PageInfo>({
  page: 0,
  total: 0,
});

interface Search {
  current: string;
  last: string;
}

const search = ref<Search>({
  current: "",
  last: "",
});

const loadMoreText = computed(() => {
  if (pageInfo.value.page >= pageInfo.value.total) {
    return "——没有更多了——";
  }
  return "——加载中——";
});

const loading = ref<boolean>(false);

const showTips = ref<boolean>(false);
const tipsTimer = ref<number>();

const showDownloadSuccess = () => {
  window.clearTimeout(tipsTimer.value);
  showTips.value = true;
  tipsTimer.value = setTimeout(() => {
    showTips.value = false;
  }, 2000);
};

const getList = async (page: number) => {
  console.log(page, loading.value, "page");
  if (loading.value) return;
  try {
    loading.value = true;
    const response = await getListHttp({
      page,
      query: search.value.last,
    });
    list.value = list.value.concat(response.data.hits);
    pageInfo.value = {
      page: response.data.page,
      total: response.data.nbPages,
    };
  } finally {
    loading.value = false;
  }
};

getList(0);

// 滚动加载
const handleScroll = async (e: Event) => {
  if (pageInfo.value.page >= pageInfo.value.total) return;
  const target = e.target as HTMLDivElement;
  const scrollBottom =
    target.scrollHeight - target.scrollTop - target.clientHeight;
  if (scrollBottom > 10) return;
  await getList(pageInfo.value.page + 1);
};

// 搜索
const handleSearch = () => {
  const current = search.value.current.trim();
  if (current === search.value.last) return;
  search.value.last = current;
  list.value = [];
  loading.value = false;
  getList(0);
};

const iconLoading = ref<string>();
const handleClick = async (record: Hits) => {
  iconLoading.value = record.objectID;
  const info = await invoke("set_icon", {
    icnsName: record.appName,
    icnsUrl: record.icnsUrl,
  });
  if (info === "success") {
    iconLoading.value = "";
    showDownloadSuccess();
  }
};
</script>

<template>
  <div class="pt-1 select-none">
    <form @submit.prevent="handleSearch">
      <input
        v-model="search.current"
        class="px-4 py-1 block mx-a my-2 text-center text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
        type="text"
        placeholder="🔎 搜索"
      />
    </form>
    <div
      class="flex flex-justify-start flex-wrap max-h-136 py-2 overflow-auto"
      @scroll="handleScroll"
    >
      <div
        v-for="item in list"
        :key="item.objectID"
        @click="handleClick(item)"
        class="w-18 m-1 p-2 cursor-pointer transition-all bg-white rounded-lg shadow-sm relative top-0 hover:shadow-lg hover:-top-0.5"
      >
        <div class="relative">
          <div
            v-if="item.objectID === iconLoading"
            class="w-16 h-16 absolute top-0 left-0 p-1 bg-gray-1 op-50"
          >
            <img :src="LoadingIcon" alt="loading" class="w-16 h-16" />
          </div>
          <img :src="item.lowResPngUrl" :alt="item.appName" class="w-18 h-18" />
        </div>
        <p
          :title="item.appName.length > 15 ? item.appName : ''"
          class="my-1 max-h-10 text-sm overflow-hidden text-center"
        >
          {{ item.appName }}
        </p>
      </div>
      <p class="color-gray-600 m-0 text-sm text-center w-full">
        ——{{ loadMoreText }}——
      </p>
    </div>
    <p
      v-show="showTips"
      class="fixed bg-white w-25 h-10 bottom-10 left-0 right-0 ma text-center line-height-10 border-rd shadow-lg"
    >
      下载成功
    </p>
  </div>
</template>
