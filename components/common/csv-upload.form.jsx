import { useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { CsvUpload } from '@/utils/file-upload';
import { PoPoAxios } from '@/utils/axios.instance';

const CsvUploadForm = ({ label, uploadUri }) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <Form>
      <Form.Input
        label={label}
        type={'file'}
        accept={'csv'}
        onChange={async (evt) => {
          const file = evt.target.files[0];
          if (!file.name.includes('.csv')) {
            alert('CSV 파일만 업로드 가능합니다.');
            return;
          }
          setUploadedFile(file);
        }}
      />

      <Button
        onClick={async () => {
          if (!uploadedFile.name.includes('.csv')) {
            alert('CSV 파일만 업로드 가능합니다.');
            return;
          }
          CsvUpload(uploadUri, uploadedFile).catch((err) => {
            const errMsg = err.response.data.message;
            alert(`업로드에 실패했습니다.\n${errMsg}`);
          });

          PoPoAxios.get('/setting/sync-rc-students-list')
            .then(() => {
              alert('업로드가 완료되었습니다!');
            })
            .catch((err) => {
              const errMsg = err.response.data.message;
              alert(`유저 목록 업데이트에 실패했습니다.\n${errMsg}`);
            });
        }}
      >
        업로드
      </Button>
    </Form>
  );
};

export default CsvUploadForm;
