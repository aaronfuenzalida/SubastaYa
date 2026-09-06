using SubastaYa.Application.Wallets.Dtos;
namespace SubastaYa.Application.Wallets.Interfaces;

public interface IWalletService
{
   Task<WalletBalanceDto> GetBalanceAsync(int userId);
   Task<WalletBalanceDto> DepositAsync(int userId, DepositDto dto);
   Task<List<TransactionDto>> GetTransactionsAsync(int userId);

}
