import {
  defEmojis,
  allEmojis,
  expressionEmojis,
  animalEmojis,
  personEmojis,
  guestrueEmojis,
  publicEmojis,
  twelveEmojis,
} from './emojis'

/**
 * 
 * @param inputs 参数一个或多个字符串
 * @returns 返回二维数组
 */
function splitEmoji(...inputs: string[]): string[][] {
  const emojiRegex: RegExp = /\p{Emoji}/u;
  const emojiArrays: string[][] = [];

  inputs.forEach((input) => {
    const emojiArray: string[] = [];
    for (const char of input) {
      if (emojiRegex.test(char)) {
        emojiArray.push(char);
      }
    }
    emojiArrays.push(emojiArray);
  });

  return [...new Set(emojiArrays)];
}

/**
 * 
 * @returns 表情对象 allEmojis,expressionEmojis,animalEmojis,personEmojis,guestrueEmojis,publicEmojis,twelveEmojis
 */
const getAllTypeEmojis = () => {
  const emojiArr = splitEmoji(allEmojis,expressionEmojis,animalEmojis,personEmojis,guestrueEmojis,publicEmojis,twelveEmojis,defEmojis)
  
  const emojiObj = {
    defEmojis: {name:"默认表情", value:emojiArr[7]},
    guestrueEmojis: {name:"手势表情", value:emojiArr[4]},
    publicEmojis: {name:"公共表情", value:emojiArr[5]},
    expressionEmojis: {name:"脸部表情", value:emojiArr[1]},
    animalEmojis: {name:"动物表情", value:emojiArr[2]},
    personEmojis: {name:"人物表情", value:emojiArr[3]},
    twelveEmojis: {name: "12生肖", value: emojiArr[6]},
    allEmojis: {name:"所有表情", value:emojiArr[0]},
  }
  return emojiObj

}
const emojiMap = {
  defEmojis: '默认表情',
  allEmojis: '所有表情',
  expressionEmojis: '脸部表情',
  animalEmojis: '动物表情',
  personEmojis: "人物表情",
  guestrueEmojis: '手势表情',
  publicEmojis: '公共表情',
  twelveEmojis: '12生肖',
}
export {
  getAllTypeEmojis,
  emojiMap
}