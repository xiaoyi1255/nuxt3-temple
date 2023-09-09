import { resolve } from 'path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    srcDir: "src/",
    ssr: false, // 默认为true false 则是 csr
    app: {
      head: {
        title: 'project name',
        meta: [],
        script: [],
        link: [],
        style: []
      },
    },
    build: {
    },
    alias: {
        "@/": "./src/"
    },
    postcss: {
        plugins: {
            // 这个工具可以实现自动添加CSS3前缀
            "autoprefixer": {
                overrideBrowserslist: ["last 5 version", ">1%", "ie >=8"]
            },
            // 'postcss-pxtorem': {
            //     rootValue: 192, // 指定转换倍率，我现在设置这个表示1rem=37.5px;
            //     propList: ['*'], // 属性列表，表示你要把哪些css属性的px转换成rem，这个*表示所有
            //     mediaQuery: false, // 是否允许使用媒体查询，false媒体查询的代码可用，true不可用
            //     exclude: 'ignore',
            //     replace: true, // 替换包含rem的规则，而不是添加回退
            //     minPixelValue: 1, // 需要转换的最小值，一般1px像素不转换，以上才转换
            //     unitPrecision: 6, // 转换成rem单位的小数点后的保留位数
            //     selectorBalckList: ["/\.van-/"], // 匹配不被转换为rem的选择器
            // },
        },
    },
    vite: {
        css: {
            preprocessorOptions: {
              less: {
                modifyVars: {
                  '@theme-colors': '#333333',
                  '@assist-colors': '#EE1B24',
                  '@white': '#FFFFFF'
                },
                javascriptEnabled: true,
                // additionalData: `@import "${resolve(__dirname, 'src/assets/style/mixin.less')}";`
              },
            },
          },
    },
    plugins: [
    ],
    modules: [
      // '@pinia/nuxt'
    ],
    runtimeConfig: {
      apiKey: "", // Default to an empty string, automatically set at runtime using process.env.NUXT_API_KEY
      public: {
        baseURL: "", // Exposed to the frontend as well.
      }

    }
})
