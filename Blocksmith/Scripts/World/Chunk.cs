using UnityEngine;

namespace Blocksmith.World
{
    public struct ChunkCoord
    {
        public int X;
        public int Z;
        public ChunkCoord(int x, int z) { X = x; Z = z; }
        public override string ToString() => $"({X},{Z})";
    }

    /// <summary>
    /// Chunk stores a 3D array of blocks with metadata, sized 16x256x16 by default.
    /// </summary>
    public class Chunk
    {
        public const int Width = 16;
        public const int Height = 256;
        public const int Depth = 16;

        public readonly ChunkCoord Coord;
        private readonly Block[] _blocks;

        public Chunk(ChunkCoord coord)
        {
            Coord = coord;
            _blocks = new Block[Width * Height * Depth];
        }

        private static int IndexOf(int x, int y, int z)
        {
            return (y * Depth + z) * Width + x;
        }

        public Block GetBlock(int x, int y, int z)
        {
            if (!InBounds(x, y, z)) return Block.Air;
            return _blocks[IndexOf(x, y, z)];
        }

        public void SetBlock(int x, int y, int z, Block block)
        {
            if (!InBounds(x, y, z)) return;
            _blocks[IndexOf(x, y, z)] = block;
        }

        public static bool InBounds(int x, int y, int z)
        {
            return x >= 0 && x < Width && y >= 0 && y < Height && z >= 0 && z < Depth;
        }
    }
}