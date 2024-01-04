<template>
  <div class="typewriter">
    <p class="typewriter-text" :style="animationStyle">{{ typedText }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: "", // 初始文案为空
      typedText: "",
      currentIndex: 0,
      typingSpeed: 0, // 动态计算的打字速度
      animationDuration: "1s" // 默认动画持续时间
    };
  },
  computed: {
    animationStyle() {
      // 动态计算 animation 属性的值
      const styleObj = {
        animation: `typing ${this.animationDuration} steps(${this.totalSteps}, end), blink-caret .5s step-end infinite`

      }
      if (this.totalSteps >= this.totalSteps) {
        styleObj.border= 'none'
      }
      return styleObj
    },
    totalSteps() {
      return this.text.length;
    }
  },
  methods: {
    async fetchData() {
      // 模拟从接口获取文案的异步操作
      // 实际项目中，你需要替换成从接口获取文案的真实逻辑
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.text = "这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案。这是从接口获取的文案";
      this.calculateTypingSpeed();
      this.typeCharacter();
    },
    calculateTypingSpeed() {
      this.animationDuration = this.totalSteps / 100 + 's'
    },
    typeCharacter() {
      if (this.currentIndex < this.totalSteps) {
        this.typedText += this.text[this.currentIndex];
        this.currentIndex++;
        this.animationFrameId = requestAnimationFrame(this.typeCharacter);
        // setTimeout(this.typeCharacter, this.typingSpeed);
      }
    }
  },
  mounted() {
    // this.fetchData(); // 获取文案并开始打字机效果
  },
  beforeUnmount() {
    // 在组件销毁前取消动画帧请求
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
};
</script>

<style scoped>
.typewriter {
  /* text-align: center; */
}

.typewriter-text {
  overflow-wrap: break-word; /* 自动换行 */
  word-wrap: break-word; /* 兼容旧浏览器 */
  white-space: pre-wrap; /* 保留空格和换行符 */
  margin: 0 auto;
  border-right: .15em solid orange;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-caret {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: orange;
  }
}
</style>
