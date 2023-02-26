import { tw } from "typewind";
import { AirdropType, AirdropTypeEnum } from '../types/airdrop';
import cls from './classesUtil';

interface ISwitchProps {
  selected: AirdropTypeEnum;
  setSelected: (selected: AirdropTypeEnum) => void;
}

export default function Switch({ selected, setSelected }: ISwitchProps) {
  return (
    <div className={tw.tabs.tabs_boxed.p_0}>
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
