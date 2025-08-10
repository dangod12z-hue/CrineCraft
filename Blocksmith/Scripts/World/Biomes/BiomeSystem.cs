using UnityEngine;
using Blocksmith.World.Noise;

namespace Blocksmith.World.Biomes
{
    public enum BiomeId { Plains, Forest, Desert, Mountains, Swamp }

    public static class BiomeSystem
    {
        public static BiomeId GetBiomeAt(int wx, int wz, int seed)
        {
            float t = NoiseUtil.FractalNoise2D(wx, wz, 0.002f, 3, 2f, 0.5f, seed);
            if (t < 0.2f) return BiomeId.Desert;
            if (t < 0.4f) return BiomeId.Plains;
            if (t < 0.6f) return BiomeId.Forest;
            if (t < 0.8f) return BiomeId.Swamp;
            return BiomeId.Mountains;
        }

        public static int GetHeightAt(int wx, int wz, int seed)
        {
            var biome = GetBiomeAt(wx, wz, seed);
            float baseHeight = biome switch
            {
                BiomeId.Desert => 62,
                BiomeId.Plains => 64,
                BiomeId.Forest => 66,
                BiomeId.Swamp => 63,
                BiomeId.Mountains => 80,
                _ => 64
            };
            float noise = NoiseUtil.FractalNoise2D(wx, wz, 0.01f, 4, 2f, 0.5f, seed);
            return Mathf.Clamp(Mathf.RoundToInt(baseHeight + (noise - 0.5f) * 20f), 4, Chunk.Height - 1);
        }
    }
}