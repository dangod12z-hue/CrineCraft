using UnityEngine;

namespace Blocksmith.Redstone
{
    public class BundledCable : RedstoneNodeBehaviour, IRedstoneProvider
    {
        public RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles)
        {
            var outBundle = RedstoneSignalBundle.CreateOff();
            for (int i = 0; i < 16; i++)
            {
                byte strength = 0;
                bool boosted = false;
                foreach (var n in neighborBundles)
                {
                    var ch = n.Channels[i];
                    if (ch.IsBoosted)
                    {
                        boosted = true; strength = 15; break;
                    }
                    if (ch.Strength > strength) strength = ch.Strength;
                }
                if (!boosted && strength > 0) strength = (byte)Mathf.Max(0, strength - 1); // simple attenuation
                outBundle.Channels[i].Strength = strength;
                outBundle.Channels[i].IsBoosted = boosted;
            }
            return outBundle;
        }
    }
}