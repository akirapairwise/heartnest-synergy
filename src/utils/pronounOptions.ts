
interface PronounOption {
  value: string;
  label: string;
}

export const pronounOptions: PronounOption[] = [
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'ze/zir', label: 'Ze/Zir' },
  { value: 'other', label: 'Other/Prefer not to say' }
];
