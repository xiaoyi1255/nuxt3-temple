<!-- <template>
    <QuillEditor />
</template> -->

<template>
    <smile-outlined
      style="font-size: 22px; margin: 0 2vh"
      @click="selectEmoji"
    />
    <Popover v-model:open="visible" title="" placement="top">
      <template #content>
        <div>
          <Emoji @emojiHandle="emojiHandle" :all="false" />
        </div>
      </template>
    </Popover>
    <Textarea
      :maxlength="100"
      @pressEnter="sendMessage"
      class="message-input"
      v-model:value.trim="message"
      placeholder="回车发送消息..."
    />
  </template>
  
  <script setup>
  import Emoji from "@/components/emoji/index.vue";
  import { SmileOutlined } from "@ant-design/icons-vue";
  import {  Textarea, Popover } from "ant-design-vue";
  
  const cursor = ref(0);
  const message = ref('')
	const visible = ref(false)

  // 发送消息
  const sendMessage = () => {}
  
  /**
   * 点击展示表情
   */
  const selectEmoji = () => {
    const Textarea = document.querySelector(".message-input");
    cursor.value = Textarea?.selectionEnd;
    cursor.value = Textarea?.selectionStart;
		console.log(Textarea?.selectionStart,Textarea?.selectionEnd)
    visible.value = !visible.value;
  };
  /**
   * 选择表情，并把表情插入输入框
   * @param {*} item 选择的表情
   */
  const emojiHandle = (item) => {
    const msg = message.value;
    if (!cursor.value) {
      message.value += item;
    } else {
      message.value = msg.slice(0, cursor.value) + item + msg.slice(cursor.value);
    }
  };
</script>