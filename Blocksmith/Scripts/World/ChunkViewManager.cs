using System.Collections.Generic;
using UnityEngine;

namespace Blocksmith.World
{
    public class ChunkViewManager : MonoBehaviour
    {
        public Material chunkMaterial;
        private readonly Dictionary<(int x, int z), ChunkRenderer> _views = new();

        private void Start()
        {
            RebuildViewsAround(transform.position, 6);
        }

        private void Update()
        {
            RebuildViewsAround(transform.position, 6);
        }

        private void RebuildViewsAround(Vector3 position, int radius)
        {
            int cx = Mathf.FloorToInt(position.x / Chunk.Width);
            int cz = Mathf.FloorToInt(position.z / Chunk.Depth);
            HashSet<(int x, int z)> needed = new();
            for (int dz = -radius; dz <= radius; dz++)
            for (int dx = -radius; dx <= radius; dx++)
            {
                int x = cx + dx; int z = cz + dz;
                needed.Add((x, z));
                if (!_views.ContainsKey((x, z)))
                {
                    var chunk = WorldManager.Instance.GetOrCreateChunk(x, z);
                    var go = new GameObject($"Chunk_{x}_{z}");
                    go.transform.position = new Vector3(x * Chunk.Width, 0, z * Chunk.Depth);
                    var rend = go.AddComponent<ChunkRenderer>();
                    var mr = go.GetComponent<MeshRenderer>();
                    if (mr != null && chunkMaterial != null) mr.sharedMaterial = chunkMaterial;
                    rend.chunk = chunk;
                    rend.Rebuild();
                    var mc = go.AddComponent<MeshCollider>();
                    var mf = go.GetComponent<MeshFilter>();
                    if (mf != null) mc.sharedMesh = mf.sharedMesh;
                    _views[(x, z)] = rend;
                }
            }
            // Remove far views
            List<(int x, int z)> toRemove = new();
            foreach (var kv in _views)
            {
                if (!needed.Contains(kv.Key)) toRemove.Add(kv.Key);
            }
            foreach (var key in toRemove)
            {
                Object.Destroy(_views[key].gameObject);
                _views.Remove(key);
            }
        }
    }
}