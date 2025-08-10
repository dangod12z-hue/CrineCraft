namespace Blocksmith.Redstone
{
    /// <summary>
    /// Sixteen independent channels, mapped to dye colors 0..15.
    /// </summary>
    public enum RedstoneChannel : byte
    {
        Channel0 = 0, Channel1, Channel2, Channel3,
        Channel4, Channel5, Channel6, Channel7,
        Channel8, Channel9, Channel10, Channel11,
        Channel12, Channel13, Channel14, Channel15
    }

    /// <summary>
    /// Redstone signal with instant update semantics and millisecond timer precision.
    /// Strength is 0..15. Infinite strength is represented via IsBoosted flag.
    /// </summary>
    public struct RedstoneSignal
    {
        public RedstoneChannel Channel;
        public byte Strength;
        public bool IsBoosted;

        public static RedstoneSignal Off(RedstoneChannel c) => new RedstoneSignal { Channel = c, Strength = 0, IsBoosted = false };
        public static RedstoneSignal Max(RedstoneChannel c) => new RedstoneSignal { Channel = c, Strength = 15, IsBoosted = false };
        public static RedstoneSignal Boosted(RedstoneChannel c) => new RedstoneSignal { Channel = c, Strength = 15, IsBoosted = true };
    }
}