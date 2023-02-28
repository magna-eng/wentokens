import { BigNumber, utils } from 'ethers';
import { Address } from 'wagmi';
import z from 'zod';

export const recipientsParser = (decimals = 18) =>
  z.preprocess(
    res => {
      let arr = res as [string, string][];
      const firstAddress = arr.at(0)?.at(0);
      if (!firstAddress || !utils.isAddress(firstAddress)) {
        arr = arr.slice(1);
      }
      return (arr).map(([address, amount]) => ({
        address: address as Address,
        amount: utils.parseUnits(amount, decimals),
      }))
  },
  z.array(
    z.object({
      address: z.coerce.string().startsWith('0x').length(42),
      amount: z.instanceof(BigNumber).refine(b => b.gte(BigNumber.from(0))),
    }),
    ),
  );
