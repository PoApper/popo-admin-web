import { Form, Modal, Radio } from 'semantic-ui-react';
import { useState } from 'react';
import { PoPoAxios } from '@/utils/axios.instance';

const WhitebookCreateModal = (props) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showOnlyLogin, setShowOnlyLogin] = useState(false);

  const [inputType, setInputType] = useState('link');
  const [link, setLink] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드 가능합니다.');
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('show_only_login', showOnlyLogin);

    if (inputType === 'link' && link) {
      formData.append('link', link);
    } else if (inputType === 'pdf' && pdfFile) {
      formData.append('pdf_file', pdfFile);
    } else {
      alert('링크 또는 PDF 파일을 입력해주세요.');
      return;
    }

    await PoPoAxios.post(`/whitebook`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        alert('생활백서를 생성했습니다.');
        window.location.reload();
      })
      .catch((err) => {
        alert('생활백서 생성에 실패했습니다.');
        console.error(err);
      });
  };

  return (
    <Modal
      closeIcon
      open={open}
      trigger={props.trigger}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>생활백서 생성</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            required
            label={'생활백서 제목'}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* PDF 또는 링크 선택 */}
          <Form.Group inline>
            <label>파일 타입 선택:</label>
            <Form.Field>
              <Radio
                label="링크 입력"
                name="inputType"
                value="link"
                checked={inputType === 'link'}
                onChange={() => {
                  setInputType('link');
                }}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="PDF 업로드"
                name="inputType"
                value="pdf"
                checked={inputType === 'pdf'}
                onChange={() => {
                  setInputType('pdf');
                }}
              />
            </Form.Field>
          </Form.Group>

          {/* 조건부 렌더링: 링크 입력 필드 */}
          {inputType === 'link' && (
            <Form.Input
              required
              label={'생활백서 링크'}
              placeholder={'https://xxxx.postech.ac.kr'}
              onChange={(e) => setLink(e.target.value)}
            />
          )}

          {/* 조건부 렌더링: PDF 업로드 필드 */}
          {inputType === 'pdf' && (
            <Form.Field>
              <Form.Input
                required
                label={'생활백서 PDF'}
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              <label>
                {pdfFile && (
                  <a
                    href={URL.createObjectURL(pdfFile)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'underline',
                    }}
                  >
                    {pdfFile.name}
                  </a>
                )}
              </label>
            </Form.Field>
          )}

          <Form.TextArea
            required
            label={'생활백서 설명글'}
            onChange={(e) => setContent(e.target.value)}
          />
          <Form.Checkbox
            required
            label={'로그인 유저에게만 보이기'}
            value={showOnlyLogin}
            onChange={() => setShowOnlyLogin(!showOnlyLogin)}
          />

          <Modal.Actions>
            <Form.Button type={'submit'} onClick={handleSubmit}>
              생성
            </Form.Button>
          </Modal.Actions>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default WhitebookCreateModal;
