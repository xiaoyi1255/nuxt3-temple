<template>
  <div class="emoji">
    <div v-if="emoji.historyList?.length">
      <p>最近使用</p>
      <ul
        class="history"
        :class="emoji.historyList?.length ? 'historyShow' : ''"
      >
        <li
          v-for="(item, index) in [...new Set(emoji.historyList)]"
          :key="index"
          @click.stop="chooseEmojiDefault(item)"
          v-html="item"
        ></li>
      </ul>
    </div>
    <p>所有表情</p>
    <ul class="default">
      <li
        v-for="(item, index) in emojiJson"
        :key="index"
        @click.stop="chooseEmojiDefault(item)"
        v-html="item"
      ></li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, reactive } from "vue";

const emit = defineEmits(["emojiHandle"]);

const emojiList =
  "😀,😄,😁,😆,😅,🤣,😂,🙂,🙃,😉,😊,😇,😕,😟,🙁,☹,😮,😯,😲,😳,🥺,😦,😧,😨,😰,😥,😢,😭,😱,😖,😣,😞,😓,😩,😫,🥱,😤,😡,😠,🤬,😈,👿,💀,☠,💩,🤡,👹,👺,👻,👽,👾,🤖,😺,😸,😹,😻,😼,😽,🙀,😿,😾,🙈,🙉,🙊,💌,💘,💝,💖,💗,💓,💞,💕,💟,❣,💔,❤️‍🔥,❤️‍🩹,❤,🧡,💨,💦,💫,💋,💯,❤‍🩹,❤‍🔥,🥵,🤧,🤮,🤢,🤕,🤒,😷,😴,🤤,🤯,🤠,🥳,🥸,😎,🤓,🧐,😒,😏,🤭,😘,🤩,😍,🥰,👁‍🗨,💤,💭,🗯,🗨,👁️‍🗨️,☺,😚,😙,🥲,😋,😛,😜,🤪,😝,🧎‍♀️,🧎‍➡️,👨🏿‍🦼‍➡️,💃🏻,🏇🏻,🤸🏼‍♀,🏋🏾‍♂️,🚵🏽‍♂,🛌🏾,🤟,🙎🏼‍♂️,🦍,🐴,🐗,🐎,🐺,🐻,🦇,🦃,🐢,🦎,🐍,🐉,🦂,🍉,🍨";

const emojiJson = computed(() => emojiList.split(","));
const emoji = reactive({
  chooseItem: "",
  historyList: [],
  allEmoji: emojiJson,
});
const chooseEmojiDefault = (item) => {
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
  height: 100%;
  background: #fff;
  // border: 1px solid #dcdfe6;
  // border-radius: 1vh;
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
