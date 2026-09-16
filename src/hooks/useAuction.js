import { useAuction as useAuctionContext } from '../context/AuctionContext';

export const useAuction = () => {
  return useAuctionContext();
};
