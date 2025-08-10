using System.Collections.Generic;
using UnityEngine;

namespace Blocksmith.World
{
    public class FluidSimulator : MonoBehaviour
    {
        private readonly Queue<Vector3Int> _updates = new();

        public void Enqueue(Vector3Int pos) => _updates.Enqueue(pos);

        private void Update()
        {
            int steps = 100; // budget per frame
            while (steps-- > 0 && _updates.Count > 0)
            {
                var p = _updates.Dequeue();
                SimulateAt(p);
            }
        }

        private void SimulateAt(Vector3Int pos)
        {
            // Placeholder: schedule neighbors; real implementation handles levels and viscosity
            foreach (var n in Neighbors(pos)) _updates.Enqueue(n);
        }

        private static IEnumerable<Vector3Int> Neighbors(Vector3Int p)
        {
            yield return p + Vector3Int.right;
            yield return p + Vector3Int.left;
            yield return p + Vector3Int.up;
            yield return p + Vector3Int.down;
            yield return p + new Vector3Int(0, 0, 1);
            yield return p + new Vector3Int(0, 0, -1);
        }
    }
}