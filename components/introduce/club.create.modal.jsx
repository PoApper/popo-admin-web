import { Form, Modal } from 'semantic-ui-react'
import { useState } from 'react'
import axios from 'axios'

const ClubCreateModal = (props) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [short_desc, setShortDesc] = useState('')
  const [clubType, setClubType] = useState('')
  const [content, setContent] = useState('')
  const [location, setLocation] = useState('')
  const [representative, setRepresentative] = useState('')
  const [contact, setContact] = useState('')
  const [logo, setLogo] = useState()

  const handleSubmit = async () => {
    try {
      let formData = new FormData()
      formData.append('name', name)
      formData.append('short_desc', short_desc)
      formData.append('clubType', clubType)
      formData.append('content', content)
      formData.append('location', location)
      formData.append('representative', representative)
      formData.append('contact', contact)
      if (logo) {
        formData.append('logo', logo)
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/introduce/club`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      setOpen(false)
      window.location.reload()
    } catch (e) {
      alert('동아리 생성에 실패했습니다.')
      console.log(e)
    }
  }

  const clubTypeOptions = [
    { key: 'performance1', text: '공연1', value: 'performance1' },
    { key: 'performance2', text: '공연2', value: 'performance2' },
    { key: 'societyAndReligion', text: '사회종교', value: 'societyAndReligion' },
    { key: 'sports', text: '체육', value: 'sports' },
    { key: 'hobbyAndExhibition', text: '취미전시', value: 'hobbyAndExhibition' },
    { key: 'study', text: '학술', value: 'study' },
  ]

  return (
    <Modal
      closeIcon
      open={open} trigger={props.trigger}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>동아리 생성</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            required
            label={'동아리 이름'}
            onChange={e => setName(e.target.value)}
          />
          <Form.Input
            required
            label={'짧은 설명'}
            placeholder={'예: 개발, 축구, 재즈'}
            onChange={e => setShortDesc(e.target.value)}
          />
          <Form.Select
            required
            label={'분과'}
            options={clubTypeOptions}
            onChange={(e, { value }) => setClubType(value)}
          />
          <Form.TextArea
            required
            label={'소개글'}
            onChange={e => setContent(e.target.value)}
          />
          <Form.Input
            required
            label={'위치'}
            placeholder={'예: 학생회관 OOO호'}
            onChange={e => setLocation(e.target.value)}
          />
          <Form.Input
            label={'대표자'}
            placeholder={'홍길동'}
            onChange={e => setRepresentative(e.target.value)}
          />
          <Form.Input
            label={'연락처'}
            placeholder={'OOOOO@postech.ac.kr'}
            onChange={e => setContact(e.target.value)}
          />
          <Form.Input
            label={'동아리 로고'}
            type={'file'}
            onChange={e => setLogo(e.target.files[0])}
          />
          <p>이미지가 없으면 기본 이미지가 표시됩니다.</p>
          <Modal.Actions>
            <Form.Button
              type={'submit'}
              onClick={handleSubmit}>
              생성
            </Form.Button>
          </Modal.Actions>
        </Form>
      </Modal.Content>
    </Modal>
  )
}

export default ClubCreateModal