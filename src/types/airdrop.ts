import { BigNumber } from 'ethers';
import { Address } from 'wagmi';

export const AirdropType = {
  ERC20: 'ERC20',
  ETH: 'ETH',
} as const;

export type AirdropTypeEnum = (typeof AirdropType)[keyof typeof AirdropType];

export type AirdropRecipient = {
  address: Address;
  amount: BigNumber;
};
