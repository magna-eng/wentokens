import { tw } from "typewind";
import { AirdropType, AirdropTypeEnum } from '../types/airdrop';
import cls from './classesUtil';

interface ISwitchProps {
  selected: AirdropTypeEnum;
  setSelected: (selected: AirdropTypeEnum) => void;
}

export default function Switch({ selected, setSelected }: ISwitchProps) {
  return (
    <div className={tw.w_full.border_2.border_neutral_700.rounded.p_1}>
      {Object.values(AirdropType).map(option => (
        <button
          key={option}
          className={cls(tw.tab.tab_lg.w_['1/2'], selected === option && tw.btn)}
          onClick={() => setSelected(option)}
        >
          <span className={selected === option ? tw.text_base_100 : tw.text_neutral_500}>{option}</span>
        </button>
      ))}
    </div>
  );
}
