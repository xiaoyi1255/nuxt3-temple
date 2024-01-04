interface Config {
  txt: string | number
  typedText: string
  currentIndex: number
  typingSpeed: number
  animationDuration: string
  totalSteps: number
  animationFrameId: number
}

/**
 * 
 * @param config 打字机配置
 * @returns 
 */
const useTypewriter = (config: Config) => {
  const newConf = Object.assign(config)
  const state = reactive({
    text: "", // 初始文案为空
    typedText: "", // 实际展示文案
    currentIndex: 0, // 当前展示下标
    typingSpeed: 0, // 动态计算的打字速度
    animationDuration: "1s", // 默认动画持续时间
    totalSteps: 0, // 步数
    animationFrameId: 0,
    ...newConf
  })
  const animationStyle = computed(() => {
    const styleObj = {
      animation: `typing ${state.animationDuration} steps(${totalSteps.value}, end), blink-caret .5s step-end infinite`

    }
    if (state.currentIndex >= state.totalSteps) {
      styleObj.border = 'none'
    }
    return styleObj
  })
  const totalSteps = computed(() => state.text?.length)
  function init() {
    calculateTypingSpeed()
    typeCharacter()
  }

  function calculateTypingSpeed() {
    state.animationDuration = totalSteps.value / 100 + 's'
    console.log(state, totalSteps.value)
  }
  function typeCharacter() {
    if (state.currentIndex < state.totalSteps) {
      state.typedText += state.text[state.currentIndex];
      state.currentIndex++;
      if (config.typingSpeed) {
        setTimeout(typeCharacter, state.typingSpeed);
      } else {
        state.animationFrameId = requestAnimationFrame(typeCharacter);
      }
    }
  }
  onMounted(() => {
    init()
  })
  onBeforeUnmount(() => {
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
    }
  })
  return {
    animationStyle,
    typedText: state.typedText
  }
}

export {
  useTypewriter
}