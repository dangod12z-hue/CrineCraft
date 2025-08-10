using System.Collections.Generic;
using UnityEngine;

namespace Blocksmith.World
{
    public class ChunkLoader : MonoBehaviour
    {
        public int viewDistance = 6;
        private Vector3Int _lastChunkPos;
        private readonly HashSet<(int x, int z)> _loaded = new();

        private void Start()
        {
            _lastChunkPos = GetPlayerChunk();
            Refresh();
        }

        private void Update()
        {
            var p = GetPlayerChunk();
            if (p != _lastChunkPos)
            {
                _lastChunkPos = p;
                Refresh();
            }
        }

        private Vector3Int GetPlayerChunk()
        {
            var pos = transform.position;
            int cx = Mathf.FloorToInt(pos.x / Chunk.Width);
            int cz = Mathf.FloorToInt(pos.z / Chunk.Depth);
            return new Vector3Int(cx, 0, cz);
        }

        private void Refresh()
        {
            int cx = _lastChunkPos.x; int cz = _lastChunkPos.z;
            HashSet<(int x, int z)> needed = new();
            for (int dz = -viewDistance; dz <= viewDistance; dz++)
            for (int dx = -viewDistance; dx <= viewDistance; dx++)
            {
                int x = cx + dx; int z = cz + dz;
                needed.Add((x, z));
                WorldManager.Instance.GetOrCreateChunk(x, z);
            }
            // Unload far chunks
            List<(int x, int z)> toRemove = new();
            foreach (var key in _loaded)
            {
                if (!needed.Contains(key)) toRemove.Add(key);
            }
            foreach (var r in toRemove) _loaded.Remove(r);
            foreach (var n in needed) _loaded.Add(n);
        }
    }
}