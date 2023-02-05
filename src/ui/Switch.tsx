import { AirdropType, AirdropTypeEnum } from '../types/airdrop';
import cls from './classesUtil';

interface ISwitchProps {
  selected: AirdropTypeEnum;
  setSelected: (selected: AirdropTypeEnum) => void;
}

export default function Switch({ selected, setSelected }: ISwitchProps) {
  return (
    <div className="tabs tabs-boxed p-0">
      {Object.values(AirdropType).map(option => (
        <button
          key={option}
          className={cls('tab tab-lg', selected === option && 'tab-active')}
          onClick={() => setSelected(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
