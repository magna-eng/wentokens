import { BigNumber, utils } from 'ethers';
import { Address } from 'wagmi';
import z, { ZodError } from 'zod';
import { AirdropRecipient } from './airdrop';

export const recipientsParser = (decimals = 18) =>
  z.preprocess(
    res => {
      const separator = /[^0-9a-fA-Fx.]/;
      const tokens = (res as string).split(separator);
      const ret: AirdropRecipient[] = [];
      for (let i = 0; i < tokens.length; i += 2) {
        ret.push({
          address: tokens[i] as Address,
          amount: utils.parseUnits(tokens[i + 1], decimals),
        });
      }
      return ret;
    },
    z.array(
      z.object({
        address: z.coerce.string().startsWith('0x').length(42),
        amount: z.instanceof(BigNumber).refine(b => b.gte(BigNumber.from(0))),
      }),
    ),
  );
