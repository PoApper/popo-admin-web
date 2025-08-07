import { PoPoAxios } from './axios.instance';

export function ImageUpload(uri, image_file) {
  let formData = new FormData();
  formData.append('image', image_file);

  return PoPoAxios.post(uri, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function CsvUpload(uri, csv_file) {
  let formData = new FormData();
  formData.append('csv_file', csv_file);

  return PoPoAxios.post(uri, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
