using System.Collections.Generic;
using UnityEngine;
using Blocksmith.Core;

namespace Blocksmith.World
{
    /// <summary>
    /// Manages chunk lifetime, procedural generation, time and weather cycles.
    /// </summary>
    public class WorldManager : Singleton<WorldManager>
    {
        private readonly Dictionary<(int x, int z), Chunk> _chunks = new();

        [Header("World Settings")]
        public int seed = 12345;
        public float dayLengthSeconds = 1200f; // 20 minute day
        public float timeOfDay01 = 0.25f; // 0..1
        public bool isRaining;
        public float weatherTimer;

        public Chunk GetOrCreateChunk(int chunkX, int chunkZ)
        {
            if (_chunks.TryGetValue((chunkX, chunkZ), out var existing)) return existing;
            var chunk = new Chunk(new ChunkCoord(chunkX, chunkZ));
            GenerateChunk(chunk);
            _chunks[(chunkX, chunkZ)] = chunk;
            return chunk;
        }

        private void GenerateChunk(Chunk chunk)
        {
            // Simple biome-based height map
            for (int x = 0; x < Chunk.Width; x++)
            for (int z = 0; z < Chunk.Depth; z++)
            {
                int wx = chunk.Coord.X * Chunk.Width + x;
                int wz = chunk.Coord.Z * Chunk.Depth + z;
                int height = Blocksmith.World.Biomes.BiomeSystem.GetHeightAt(wx, wz, seed);
                for (int y = 0; y < height - 3; y++) chunk.SetBlock(x, y, z, new Block { Id = BlockId.Stone });
                chunk.SetBlock(x, height - 3, z, new Block { Id = BlockId.Dirt });
                chunk.SetBlock(x, height - 2, z, new Block { Id = BlockId.Dirt });
                chunk.SetBlock(x, height - 1, z, new Block { Id = BlockId.Grass });
                for (int y = height; y < Chunk.Height; y++) chunk.SetBlock(x, y, z, Block.Air);
            }
        }

        private void Update()
        {
            // Time of day progression
            timeOfDay01 += Time.deltaTime / Mathf.Max(1f, dayLengthSeconds);
            if (timeOfDay01 > 1f) timeOfDay01 -= 1f;

            // Weather cycle
            weatherTimer -= Time.deltaTime;
            if (weatherTimer <= 0f)
            {
                isRaining = Random.value < 0.2f ? !isRaining : isRaining;
                weatherTimer = Random.Range(60f, 240f);
            }
        }
    }
}