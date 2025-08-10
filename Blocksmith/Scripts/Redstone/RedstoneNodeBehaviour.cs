using UnityEngine;

namespace Blocksmith.Redstone
{
    public abstract class RedstoneNodeBehaviour : MonoBehaviour
    {
        protected virtual void OnEnable()
        {
            var pos = Vector3Int.RoundToInt(transform.position);
            var provider = this as IRedstoneProvider;
            if (provider != null)
            {
                RedstoneNetwork.Instance.RegisterNode(pos, provider);
                RedstoneNetwork.Instance.OnNeighborChanged(pos);
            }
        }

        protected virtual void OnDisable()
        {
            var pos = Vector3Int.RoundToInt(transform.position);
            var provider = this as IRedstoneProvider;
            if (provider != null)
            {
                RedstoneNetwork.Instance.UnregisterNode(pos, provider);
                RedstoneNetwork.Instance.OnNeighborChanged(pos);
            }
        }
    }
}