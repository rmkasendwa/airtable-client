import { useDecorators } from '@tsed/core';

export function Authorize(...permissions: string[]) {
  // This just a place holder function
  console.log({ permissions });
  return useDecorators();
}
