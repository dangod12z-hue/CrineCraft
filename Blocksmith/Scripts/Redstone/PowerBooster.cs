using UnityEngine;

namespace Blocksmith.Redstone
{
    public class PowerBooster : RedstoneNodeBehaviour, IRedstoneProvider
    {
        [Tooltip("Channels to force to boosted state.")]
        public bool[] forceOnChannels = new bool[16];

        public RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles)
        {
            var outBundle = RedstoneSignalBundle.CreateOff();
            for (int i = 0; i < 16; i++)
            {
                if (forceOnChannels[i])
                {
                    outBundle.Channels[i] = RedstoneSignal.Boosted((RedstoneChannel)i);
                }
                else
                {
                    // Pass-through boosted if any neighbor is boosted on this channel
                    bool boosted = false; byte strength = 0;
                    foreach (var n in neighborBundles)
                    {
                        var ch = n.Channels[i];
                        boosted |= ch.IsBoosted;
                        if (ch.Strength > strength) strength = ch.Strength;
                    }
                    outBundle.Channels[i].IsBoosted = boosted;
                    outBundle.Channels[i].Strength = strength;
                }
            }
            return outBundle;
        }
    }
}