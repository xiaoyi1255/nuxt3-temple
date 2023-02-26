import { useState } from '#app'
import { ref} from 'vue'

export const useComData = function () {
    const count = ref(1)
    return useState('data', () => count)
}