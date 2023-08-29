// md5Worker.js

self.importScripts('./park-md5.js');

self.addEventListener('message', async (event) => {
  const chunks = event.data;
  const md5 = await createMd5(chunks);
  self.postMessage({data: md5});
})

const createMd5 = (chunks) => {
  const spark = new self.SparkMD5();

  return new Promise((resolve) => {
    function _read(i) {
      if (i >= chunks.length) {
        const md5 = spark.end();
        resolve(md5);
        return;
      }

      const blob = chunks[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        const bytes = e?.target?.result;
        spark.append(bytes);
        _read(i + 1);
      };
      reader.readAsArrayBuffer(blob);
    }
    _read(0);
  });
};
