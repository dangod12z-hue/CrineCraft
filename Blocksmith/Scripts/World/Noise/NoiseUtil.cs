using UnityEngine;

namespace Blocksmith.World.Noise
{
    public static class NoiseUtil
    {
        public static float Perlin2D(float x, float y, float scale, int seed)
        {
            return Mathf.PerlinNoise(x * scale + seed * 0.001f, y * scale + seed * 0.001f);
        }

        public static float FractalNoise2D(float x, float y, float baseScale, int octaves, float lacunarity, float gain, int seed)
        {
            float amp = 1f;
            float freq = baseScale;
            float sum = 0f;
            float norm = 0f;
            for (int i = 0; i < octaves; i++)
            {
                sum += Perlin2D(x, y, freq, seed + i * 37) * amp;
                norm += amp;
                amp *= gain; freq *= lacunarity;
            }
            return sum / Mathf.Max(0.0001f, norm);
        }
    }
}