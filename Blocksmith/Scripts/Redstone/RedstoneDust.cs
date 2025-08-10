using UnityEngine;

namespace Blocksmith.Redstone
{
    public class RedstoneDust : MonoBehaviour, IRedstoneProvider
    {
        [Range(0,15)] public int channel;

        private void OnEnable()
        {
            var pos = Vector3Int.RoundToInt(transform.position);
            RedstoneNetwork.Instance.RegisterNode(pos, this);
        }

        private void OnDisable()
        {
            var pos = Vector3Int.RoundToInt(transform.position);
            RedstoneNetwork.Instance.UnregisterNode(pos, this);
        }

        public RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles)
        {
            var outBundle = RedstoneSignalBundle.CreateOff();
            int ch = Mathf.Clamp(channel, 0, 15);
            byte strength = 0; bool boosted = false;
            foreach (var n in neighborBundles)
            {
                var c = n.Channels[ch];
                if (c.IsBoosted) { boosted = true; strength = 15; break; }
                if (c.Strength > strength) strength = c.Strength;
            }
            if (!boosted && strength > 0) strength = (byte)Mathf.Max(0, strength - 1);
            outBundle.Channels[ch].Strength = strength;
            outBundle.Channels[ch].IsBoosted = boosted;
            return outBundle;
        }
    }
}