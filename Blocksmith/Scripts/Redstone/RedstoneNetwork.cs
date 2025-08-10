using System.Collections.Generic;
using UnityEngine;
using Blocksmith.Core;

namespace Blocksmith.Redstone
{
    /// <summary>
    /// Manages redstone updates with instant propagation, bundled cables, and gates.
    /// Uses a dependency graph to avoid per-frame ticks for static circuits.
    /// </summary>
    public class RedstoneNetwork : Singleton<RedstoneNetwork>
    {
        private readonly Dictionary<Vector3Int, RedstoneNode> _nodes = new();

        internal bool InternalTryGetBundle(Vector3Int position, out RedstoneSignalBundle bundle)
        {
            if (_nodes.TryGetValue(position, out var node)) { bundle = node.Bundle; return true; }
            bundle = RedstoneSignalBundle.CreateOff(); return false;
        }

        public void RegisterNode(Vector3Int position, IRedstoneProvider provider)
        {
            if (!_nodes.TryGetValue(position, out var node))
            {
                node = new RedstoneNode(position);
                _nodes[position] = node;
            }
            node.Provider = provider;
            RecomputeFrom(position);
        }

        public void UnregisterNode(Vector3Int position, IRedstoneProvider provider)
        {
            if (_nodes.TryGetValue(position, out var node) && node.Provider == provider)
            {
                _nodes.Remove(position);
                RecomputeFrom(position);
            }
        }

        public void OnNeighborChanged(Vector3Int position)
        {
            RecomputeFrom(position);
        }

        private void RecomputeFrom(Vector3Int origin)
        {
            // Breadth-first propagation across adjacency; per-node computes 16 channels.
            Queue<Vector3Int> open = new Queue<Vector3Int>();
            HashSet<Vector3Int> visited = new HashSet<Vector3Int>();
            open.Enqueue(origin);
            while (open.Count > 0)
            {
                var pos = open.Dequeue();
                if (!visited.Add(pos)) continue;
                if (!_nodes.TryGetValue(pos, out var node)) continue;
                var oldBundle = node.Bundle;
                node.Recompute();
                if (!node.Bundle.Equals(oldBundle))
                {
                    foreach (var n in GetNeighborPositions(pos))
                    {
                        open.Enqueue(n);
                    }
                }
            }
        }

        public static IEnumerable<Vector3Int> GetNeighborPositions(Vector3Int p)
        {
            yield return p + Vector3Int.right;
            yield return p + Vector3Int.left;
            yield return p + Vector3Int.up;
            yield return p + Vector3Int.down;
            yield return p + new Vector3Int(0, 0, 1);
            yield return p + new Vector3Int(0, 0, -1);
        }
    }

    public interface IRedstoneProvider
    {
        /// <summary>
        /// Return output bundle for all 16 channels at this node given neighbors.
        /// Implementations should be pure for given neighbor inputs.
        /// </summary>
        RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles);
    }

    /// <summary>
    /// Sixteen-channel signal bundle.
    /// </summary>
    public struct RedstoneSignalBundle
    {
        public RedstoneSignal[] Channels; // length 16

        public static RedstoneSignalBundle CreateOff()
        {
            var b = new RedstoneSignalBundle { Channels = new RedstoneSignal[16] };
            for (int i = 0; i < 16; i++) b.Channels[i] = RedstoneSignal.Off((RedstoneChannel)i);
            return b;
        }

        public bool Equals(RedstoneSignalBundle other)
        {
            if (Channels == null || other.Channels == null) return false;
            for (int i = 0; i < 16; i++)
            {
                if (Channels[i].Strength != other.Channels[i].Strength || Channels[i].IsBoosted != other.Channels[i].IsBoosted)
                    return false;
            }
            return true;
        }
    }

    internal class RedstoneNode
    {
        public Vector3Int Position { get; }
        public IRedstoneProvider Provider { get; set; }
        public RedstoneSignalBundle Bundle;

        public RedstoneNode(Vector3Int pos)
        {
            Position = pos;
            Bundle = RedstoneSignalBundle.CreateOff();
        }

        public void Recompute()
        {
            var neighborBundles = new RedstoneSignalBundle[6];
            int i = 0;
            foreach (var npos in RedstoneNetwork.GetNeighborPositions(Position))
            {
                if (RedstoneNetwork.Instance.TryGetBundle(npos, out var b)) neighborBundles[i] = b;
                else neighborBundles[i] = RedstoneSignalBundle.CreateOff();
                i++;
            }
            if (Provider != null)
            {
                Bundle = Provider.GetOutput(neighborBundles);
            }
        }
    }

    public static class RedstoneNetworkExtensions
    {
        public static bool TryGetBundle(this RedstoneNetwork network, Vector3Int position, out RedstoneSignalBundle bundle)
        {
            return network.InternalTryGetBundle(position, out bundle);
        }
    }
}