import {operatorName} from '@/lib/legal';

export function OperatorName() {
  const englishName = operatorName.match(/\(([^)]+)\)/)?.[1] ?? operatorName;
  return <><span className="operator-name-en">{englishName}</span><span className="operator-name-th">{operatorName}</span></>;
}
