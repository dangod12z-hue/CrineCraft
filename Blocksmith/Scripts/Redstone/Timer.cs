using UnityEngine;

namespace Blocksmith.Redstone
{
    public class RedstoneTimer : RedstoneNodeBehaviour, IRedstoneProvider
    {
        [Range(1, 10000)] public int intervalMs = 500;
        private float _accum;
        private bool _state;

        private void Update()
        {
            _accum += Time.deltaTime * 1000f;
            while (_accum >= intervalMs)
            {
                _accum -= intervalMs;
                _state = !_state;
                // Notify network by neighbor change
                var pos = Vector3Int.RoundToInt(transform.position);
                RedstoneNetwork.Instance.OnNeighborChanged(pos);
            }
        }

        public RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles)
        {
            var bundle = RedstoneSignalBundle.CreateOff();
            byte s = _state ? (byte)15 : (byte)0;
            for (int i = 0; i < 16; i++) bundle.Channels[i].Strength = s;
            return bundle;
        }
    }
}