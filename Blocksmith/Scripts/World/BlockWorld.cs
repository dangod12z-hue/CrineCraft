using System.Collections.Generic;
using UnityEngine;
using Blocksmith.Redstone;

namespace Blocksmith.World
{
    public class BlockWorld : MonoBehaviour
    {
        private readonly Dictionary<(int x, int z), Chunk> _chunks = new();

        public Chunk GetChunk(int chunkX, int chunkZ)
        {
            if (_chunks.TryGetValue((chunkX, chunkZ), out var c)) return c;
            var cnew = new Chunk(new ChunkCoord(chunkX, chunkZ));
            _chunks[(chunkX, chunkZ)] = cnew; return cnew;
        }

        public Block GetBlock(Vector3Int worldPos)
        {
            GetLocal(worldPos, out var chunk, out int lx, out int ly, out int lz);
            return chunk.GetBlock(lx, ly, lz);
        }

        public void SetBlock(Vector3Int worldPos, Block block)
        {
            GetLocal(worldPos, out var chunk, out int lx, out int ly, out int lz);
            chunk.SetBlock(lx, ly, lz, block);
            // Notify redstone
            var pos = WorldToGrid(worldPos);
            RedstoneNetwork.Instance.OnNeighborChanged(pos);
        }

        public static Vector3Int WorldToGrid(Vector3Int world) => world;

        private void GetLocal(Vector3Int world, out Chunk chunk, out int lx, out int ly, out int lz)
        {
            int cx = Mathf.FloorToInt((float)world.x / Chunk.Width);
            int cz = Mathf.FloorToInt((float)world.z / Chunk.Depth);
            chunk = GetChunk(cx, cz);
            lx = (world.x % Chunk.Width + Chunk.Width) % Chunk.Width;
            ly = Mathf.Clamp(world.y, 0, Chunk.Height - 1);
            lz = (world.z % Chunk.Depth + Chunk.Depth) % Chunk.Depth;
        }
    }
}