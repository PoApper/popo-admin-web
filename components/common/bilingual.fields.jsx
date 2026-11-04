import { useEffect, useId, useState } from 'react';
import { Form, Menu, Segment } from 'semantic-ui-react';
import styled from 'styled-components';

const definitions = {
  place: [
    { name: 'name', label: '장소 이름', required: true },
    { name: 'location', label: '위치', required: true },
    { name: 'description', label: '설명', required: true, multiline: true },
  ],
  equipment: [
    { name: 'name', label: '장비 이름', required: true },
    { name: 'description', label: '설명', required: true, multiline: true },
  ],
  association: [
    { name: 'name', label: '자치단체 이름', required: true },
    { name: 'location', label: '위치', required: true },
    { name: 'representative', label: '대표자', required: true },
    { name: 'contact', label: '연락처', required: true },
    { name: 'content', label: '소개글', required: true, multiline: true },
  ],
  club: [
    { name: 'name', label: '동아리 이름', required: true },
    { name: 'shortDesc', label: '짧은 설명', required: true },
    { name: 'location', label: '위치', required: true },
    { name: 'representative', label: '대표자', requiredOnUpdate: true },
    { name: 'contact', label: '연락처', requiredOnUpdate: true },
    { name: 'content', label: '소개글', required: true, multiline: true },
  ],
  student_association: [
    { name: 'name', label: '학생단체 이름', required: true },
    { name: 'shortDesc', label: '짧은 설명', required: true },
    { name: 'location', label: '위치', required: true },
    { name: 'representative', label: '대표자', required: true },
    { name: 'office', label: '협력 행정팀', required: true },
    { name: 'contact', label: '연락처', required: true },
    { name: 'content', label: '소개글', required: true, multiline: true },
  ],
};

export function useBilingualFields(kind, initial = {}) {
  const id = useId();
  const fields = definitions[kind].map((field) => ({
    ...field,
    required:
      field.required || (field.requiredOnUpdate && Boolean(initial.uuid)),
  }));
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.flatMap(({ name }) =>
        [name, `${name}En`].map((key) => [
          key,
          typeof initial[key] === 'string' ? initial[key] : '',
        ]),
      ),
    ),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [focusRequest, setFocusRequest] = useState(null);

  const setValue = (key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    for (const field of fields) {
      if (field.required && !values[field.name].trim()) {
        nextErrors[field.name] = '국문 내용을 입력해 주세요.';
      }
      const key = `${field.name}En`;
      const english = values[key].trim();
      const tooLong = field.multiline
        ? new TextEncoder().encode(english).length > 65_535
        : english.length > 255;
      if (tooLong) nextErrors[key] = '영문 내용이 허용된 길이를 초과했습니다.';
    }
    setErrors(nextErrors);
    const missingKorean = fields.find(({ name }) => nextErrors[name]);
    const firstError = missingKorean?.name ?? Object.keys(nextErrors)[0];
    if (firstError) {
      setActiveIndex(missingKorean ? 0 : 1);
      setFocusRequest((previous) => ({
        key: firstError,
        sequence: (previous?.sequence ?? 0) + 1,
      }));
      return false;
    }
    return true;
  };

  const payload = () =>
    Object.fromEntries(
      fields.flatMap(({ name }) => [
        [name, values[name]],
        [`${name}En`, values[`${name}En`].trim() || null],
      ]),
    );

  return {
    id,
    fields,
    values,
    setValue,
    activeIndex,
    setActiveIndex,
    errors,
    focusRequest,
    validate,
    payload,
  };
}

const BilingualFields = ({ form }) => {
  const { id, activeIndex, focusRequest } = form;
  const english = activeIndex === 1;

  useEffect(() => {
    if (focusRequest) {
      document.getElementById(`${id}-${focusRequest.key}`)?.focus();
    }
  }, [id, focusRequest]);

  const selectTab = (event, index) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next =
        event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      form.setActiveIndex(next);
      document.getElementById(`${id}-tab-${next}`)?.focus();
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Menu secondary pointing role="tablist" aria-label="콘텐츠 언어">
        {['국문', 'English'].map((label, index) => (
          <Menu.Item
            as="button"
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            key={label}
            active={activeIndex === index}
            aria-selected={activeIndex === index}
            aria-controls={`${id}-panel`}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => form.setActiveIndex(index)}
            onKeyDown={(event) => selectTab(event, index)}
          >
            {label}
          </Menu.Item>
        ))}
      </Menu>
      <Segment
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${activeIndex}`}
      >
        {english && (
          <p>영문 항목이 비어 있으면 해당 항목의 국문 내용이 표시됩니다.</p>
        )}
        <FieldsGrid>
          {form.fields.map((field) => {
            const key = english ? `${field.name}En` : field.name;
            const Input = field.multiline ? Form.TextArea : Form.Input;
            return (
              <Input
                key={key}
                id={`${id}-${key}`}
                name={key}
                label={field.label}
                required={!english && field.required}
                value={form.values[key]}
                error={form.errors[key] ? { content: form.errors[key] } : false}
                maxLength={
                  english ? (field.multiline ? 65_535 : 255) : undefined
                }
                rows={field.multiline ? 5 : undefined}
                className={field.multiline ? 'bilingual-long' : undefined}
                onChange={(event) => form.setValue(key, event.target.value)}
              />
            );
          })}
        </FieldsGrid>
      </Segment>
    </div>
  );
};

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  > .field {
    min-width: 0;
    margin: 0 !important;
  }

  > .bilingual-long {
    grid-column: 1 / -1;
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export default BilingualFields;
