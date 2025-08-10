using UnityEngine;

namespace Blocksmith.Redstone
{
    /// <summary>
    /// Microchip encapsulates a small internal circuit. Simplified: maps selected input channels to outputs.
    /// Future: embed an internal RedstoneNetwork.
    /// </summary>
    public class Microchip : RedstoneNodeBehaviour, IRedstoneProvider
    {
        [Tooltip("For each channel 0..15, select input channel index that feeds output (or -1 for off).")]
        public int[] inputToOutputMap = new int[16];

        public RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles)
        {
            var outBundle = RedstoneSignalBundle.CreateOff();
            for (int outCh = 0; outCh < 16; outCh++)
            {
                int inCh = inputToOutputMap[outCh];
                if (inCh < 0 || inCh >= 16) continue;
                byte strength = 0; bool boosted = false;
                foreach (var n in neighborBundles)
                {
                    var ch = n.Channels[inCh];
                    boosted |= ch.IsBoosted; if (ch.Strength > strength) strength = ch.Strength;
                }
                outBundle.Channels[outCh].Strength = strength;
                outBundle.Channels[outCh].IsBoosted = boosted;
            }
            return outBundle;
        }
    }
}