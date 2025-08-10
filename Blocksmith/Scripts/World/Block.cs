using UnityEngine;

namespace Blocksmith.World
{
    public enum BlockId : ushort
    {
        Air = 0,
        Stone = 1,
        Dirt = 2,
        Grass = 3,
        Sand = 4,
        Water = 5,
        Lava = 6,
        Log = 7,
        Leaves = 8,
        RedstoneDust = 100,
        RedstoneTorch = 101,
        RedstoneGate = 102,
        ProgrammableBlock = 150,
        Microchip = 151,
        PowerBooster = 152,
        BundledCable = 153,
    }

    [System.Flags]
    public enum BlockFlags : byte
    {
        None = 0,
        Solid = 1 << 0,
        Opaque = 1 << 1,
        Fluid = 1 << 2,
        EmitsLight = 1 << 3,
        Redstone = 1 << 4,
        Interactable = 1 << 5,
    }

    /// <summary>
    /// Compact block value stored in chunks. Additional data uses metadata arrays.
    /// </summary>
    public struct Block
    {
        public BlockId Id;
        public byte Metadata;

        public static Block Air => new Block { Id = BlockId.Air, Metadata = 0 };

        public bool IsAir => Id == BlockId.Air;
    }
}