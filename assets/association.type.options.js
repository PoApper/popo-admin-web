export const AssociationTypeOptions = [
  { key: 'executive', text: '집행기구', value: 'executive' },
  { key: 'autonomous', text: '자치기구', value: 'autonomous' },
  { key: 'media', text: '언론기구', value: 'media' },
  { key: 'specialized', text: '전문기구', value: 'specialized' },
];

export const AssociationTypeDisplayName = {
  executive: '집행기구',
  autonomous: '자치기구',
  media: '언론기구',
  specialized: '전문기구',
  집행기구: '집행기구',
  자치기구: '자치기구',
  언론기구: '언론기구',
  전문기구: '전문기구',
};

export function getAssociationTypeValue(associationType) {
  if (!associationType) {
    return '';
  }

  const associationTypeEntry = Object.entries(AssociationTypeDisplayName).find(
    ([key, value]) => key === associationType || value === associationType,
  );

  return associationTypeEntry ? associationTypeEntry[0] : '';
}

export function getAssociationTypeDisplayName(associationType) {
  if (!associationType) {
    return '-';
  }

  return AssociationTypeDisplayName[associationType] ?? associationType;
}
