namespace SubastaYa.Domain;

public static class AuditActions
{
    public const string TimeExtended = "TIME_EXTENDED";
    public const string StatusChanged = "STATUS_CHANGED";
    public const string ManualDeposit = "MANUAL_DEPOSIT";
    public const string BidRejectedByConcurrency = "BID_REJECTED_CONCURRENCY";
}
