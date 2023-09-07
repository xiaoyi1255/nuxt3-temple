<template>
  <div class="emoji">
    <div v-if="emoji.historyList?.length">
      <p>最近使用</p>
      <ul class="history" :class="emoji.historyList?.length ? 'historyShow' : ''">
        <li v-for="(item, index) in [...new Set(emoji.historyList)]" :key="index" @click.stop="chooseEmojiDefault(item)"
          v-html="item"></li>
      </ul>
    </div>
    <div v-for="items in emojiObj" :key="items.name">
      <template v-if="items.name && items.value?.length">
        <p>{{ items.name }}</p>
        <ul class="default">
          <li v-for="(item, index) in items.value" :key="index" @click.stop="chooseEmojiDefault(item)" v-html="item"></li>
        </ul>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { getAllTypeEmojis } from './utils'

const emit = defineEmits(["emojiHandle"]);
const props = defineProps({
  all: {
    type: Boolean,
    default: false
  }
})

const res = getAllTypeEmojis()
console.log(res)
const emojiObj = ref({})

if (props.all) {
  emojiObj.value = res
} else {
  emojiObj.value = {
    defEmojis: res.defEmojis
  }
}
const emoji = reactive({
  chooseItem: "",
  historyList: [],
  allEmoji: emojiObj.value,
});
const chooseEmojiDefault = (item: string) => {
  emoji.chooseItem = item;
  emoji.historyList.unshift(item);
  emit("emojiHandle", item);
  return item;
};
</script>

<style lang="less" scoped>
.history::-webkit-scrollbar,
.default::-webkit-scrollbar {
  display: none;
}

.emoji {
  text-align: left;
  width: 70vw;
  max-height: 20vh;
  background: #fff;
  overflow-y: auto;


  p {
    font-size: 14px;
    padding: 1vh;
  }

  .history,
  .default {
    width: 100%;
    height: 20vh;
    overflow-y: auto;

    li {
      display: inline-block;
      padding: 1vh;
      font-size: 26px;
      width: 32px;
      height: 32px;
      line-height: 1;
      overflow: hidden;
      cursor: pointer;
    }

    li:hover {
      background-color: #ececec;
    }
  }

  .history {
    height: 0;
    width: 100%;
    position: relative;
    transition: all 2.5s;
  }

  .historyShow {
    height: 40px;
  }
}

@media screen and (max-width: 800px) {
  .emoji {
    width: 80vw;
  }
}
</style>
