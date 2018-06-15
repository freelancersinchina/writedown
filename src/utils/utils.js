import axios from 'axios';
import lrz from 'lrz';
import config from './config';``

export async function uploadImages(data) {
    const files = data.images;
    const token = data.token;
    const {compress} = data
    let uploads = [];
    for (let i = 0; i < files.length; i++) {
  
      uploads.push(lrz(files[i], {  quality: !compress?1:0.5 }));
  
    }
  
    return Promise.all(
      uploads
    ).then((res) => {
      let uploads = [];
  
      for (let i = 0; i < res.length; i++) {
        let formData = res[i].formData;
        formData.append('token', token);
  
        uploads.push(
          axios({
            url: config.qiniu.uploadHost,
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        );
      }
  
      return Promise.all(uploads).then((res) => {
        const data = res.map((image) => {
          return `${config.qiniu.imageHost}/${image.data.key}`;
        });
  
        return data;
      });
    });
  }
  
  