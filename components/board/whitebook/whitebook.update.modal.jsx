import { Button, Form, Icon, Modal, Radio } from 'semantic-ui-react';
import { useState } from 'react';
import DeleteConfirmModal from '../../common/delete.confirm.modal';
import { PoPoAxios } from '@/utils/axios.instance';

const WhitebookUpdateModal = ({ trigger, whitebook }) => {
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [title, setTitle] = useState(whitebook.title);
  const [content, setContent] = useState(whitebook.content);
  const [showOnlyLogin, setShowOnlyLogin] = useState(whitebook.show_only_login);
  const [inputType, setInputType] = useState(whitebook.link ? 'link' : 'pdf');
  const [link, setLink] = useState(whitebook.link || '');
  const [uploadedPDFLink, setUploadedPDFLink] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const handleModalOpen = () => {
    setOpen(true);
    // 링크에 whitebook이 들어간다면 S3에 있는 pdf 파일임
    if (whitebook.link && whitebook.link.includes('whitebook')) {
      const link = whitebook.link;
      setLink('');
      setUploadedPDFLink(link);
      setInputType('pdf');
    }
  };

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
      // title, content, show_only_login 중 하나라도 변경되었다면 수정 가능
      if (
        title !== whitebook.title ||
        content !== whitebook.cotent ||
        showOnlyLogin !== whitebook.show_only_login
      ) {
        const link = inputType === 'link' ? link : uploadedPDFLink;
        formData.append('link', link);
      } else {
        alert('링크 또는 PDF 파일을 입력해주세요.');
        return;
      }
    }

    await PoPoAxios.put(`/whitebook/${whitebook.uuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        alert('생활백서 정보를 수정 했습니다.');
        window.location.reload();
      })
      .catch((err) => {
        alert('생활백서 수정에 실패했습니다.');
        console.error(err);
      });
  };

  return (
    <Modal
      closeIcon
      open={open}
      trigger={trigger}
      onClose={() => setOpen(false)}
      onOpen={handleModalOpen}
    >
      <Modal.Header>생활백서 수정</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            required
            label={'생활백서 제목'}
            value={title}
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
              value={link}
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
                {(pdfFile || uploadedPDFLink) && (
                  <a
                    href={
                      pdfFile ? URL.createObjectURL(pdfFile) : uploadedPDFLink
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'underline',
                    }}
                  >
                    {pdfFile ? pdfFile.name : '기존 PDF 확인'}
                  </a>
                )}
              </label>
            </Form.Field>
          )}

          <Form.TextArea
            required
            label={'생활백서 설명글'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Form.Checkbox
            required
            label={'로그인 유저에게만 보이기'}
            value={showOnlyLogin}
            onChange={() => setShowOnlyLogin(!showOnlyLogin)}
          />

          <Modal.Actions>
            <Form.Group>
              <Form.Button type={'submit'} onClick={handleSubmit}>
                수정
              </Form.Button>
              <DeleteConfirmModal
                open={deleteModalOpen}
                target={whitebook.title}
                deleteURI={`whitebook/${whitebook.uuid}`}
                trigger={
                  <Button negative onClick={() => setDeleteModalOpen(true)}>
                    <Icon name={'trash'} /> 삭제
                  </Button>
                }
              />
            </Form.Group>
          </Modal.Actions>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default WhitebookUpdateModal;
