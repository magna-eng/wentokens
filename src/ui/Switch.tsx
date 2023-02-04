import { AirdropType, AirdropTypeEnum } from '../types/airdrop';
import cls from './classesUtil';

interface ISwitchProps {
  selected: AirdropTypeEnum;
  setSelected: (selected: AirdropTypeEnum) => void;
}

export default function Switch({ selected, setSelected }: ISwitchProps) {
  return (
    <div className="tabs tabs-boxed">
      {Object.values(AirdropType).map(option => (
        <button className={cls('tab tab-md', selected === option && 'tab-active')} onClick={() => setSelected(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}
